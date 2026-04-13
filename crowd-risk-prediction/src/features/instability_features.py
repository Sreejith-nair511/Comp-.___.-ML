import numpy as np
import torch
from scipy.ndimage import sobel
from scipy.stats import entropy
from sklearn.cluster import KMeans
from typing import Dict, Tuple
import cv2

class InstabilityFeatures:
    def __init__(self):
        pass

    def calculate_directional_entropy(self, flow_angles: np.ndarray, bins: int = 16) -> float:
        """
        Calculate directional entropy (H_d) over quantized motion directions
        Args:
            flow_angles: Array of flow angles in radians
            bins: Number of bins for histogram quantization
        Returns:
            Directional entropy value
        """
        # Flatten the angle array and remove any NaN values
        flat_angles = flow_angles.flatten()
        flat_angles = flat_angles[~np.isnan(flat_angles)]
        
        if len(flat_angles) == 0:
            return 0.0
            
        # Create histogram of flow angles
        hist, _ = np.histogram(flat_angles, bins=bins, range=(0, 2*np.pi))
        
        # Normalize histogram to get probability distribution
        hist = hist.astype(float)
        hist = hist / hist.sum() if hist.sum() > 0 else hist
        
        # Remove zero probabilities to avoid log(0)
        hist = hist[hist > 0]
        
        # Calculate entropy
        if len(hist) > 0:
            directional_entropy = -np.sum(hist * np.log(hist + 1e-10))  # Adding small epsilon to prevent log(0)
        else:
            directional_entropy = 0.0
            
        return directional_entropy

    def calculate_flow_opposition_index(self, flow_vectors: np.ndarray, window_size: int = 32) -> np.ndarray:
        """
        Calculate percentage of vectors opposing dominant direction in local window using vectorized ops
        Args:
            flow_vectors: Array of flow vectors (H, W, 2)
            window_size: Size of local window for analysis
        Returns:
            FOI map with same dimensions as input
        """
        h, w, _ = flow_vectors.shape
        
        # 1. Calculate local average flow direction using box filter
        avg_flow_x = cv2.boxFilter(flow_vectors[..., 0], -1, (window_size, window_size))
        avg_flow_y = cv2.boxFilter(flow_vectors[..., 1], -1, (window_size, window_size))
        
        # 2. Compute local dominant angles
        local_avg_angles = np.arctan2(avg_flow_y, avg_flow_x)
        
        # 3. Create unit vectors in the local dominant direction
        dom_u = np.cos(local_avg_angles)
        dom_v = np.sin(local_avg_angles)
        
        # 4. Normalize individual flow vectors to unit vectors for cosine similarity
        u = flow_vectors[..., 0]
        v = flow_vectors[..., 1]
        mag = np.sqrt(u**2 + v**2) + 1e-10
        u_unit = u / mag
        v_unit = v / mag
        
        # 5. Calculate cosine similarity between individual vectors and local dominant direction
        # cos_sim = (u1*u2 + v1*v2) / (mag1*mag2)
        cos_sim = u_unit * dom_u + v_unit * dom_v
        
        # 6. Opposition: cos_sim < cos(135 degrees) = -0.707
        # Vectors roughly 180 (±45) degrees from local dominant
        opposition_mask = (cos_sim < -0.707).astype(np.float32)
        
        # 7. Calculate percentage of opposing vectors in each window
        foi_map = cv2.boxFilter(opposition_mask, -1, (window_size, window_size))
        
        return foi_map

    def calculate_local_motion_compression_score(self, density_map: np.ndarray, 
                                               velocity_magnitude: np.ndarray,
                                               alpha: float = 0.7) -> np.ndarray:
        """
        Calculate LMCS: High density gradient + decreasing velocity magnitude
        Args:
            density_map: Normalized density map
            velocity_magnitude: Velocity magnitude map
            alpha: Weight for combining density and velocity components
        Returns:
            LMCS map
        """
        # Calculate density gradient
        density_grad_x = sobel(density_map, axis=1)
        density_grad_y = sobel(density_map, axis=0)
        density_gradient = np.sqrt(density_grad_x**2 + density_grad_y**2)
        
        # Calculate velocity gradient (areas where velocity decreases)
        vel_grad_x = sobel(velocity_magnitude, axis=1)
        vel_grad_y = sobel(velocity_magnitude, axis=0)
        velocity_gradient = np.sqrt(vel_grad_x**2 + vel_grad_y**2)
        
        # Areas of high density gradient and low velocity (compression zones)
        # We want areas where density is high AND velocity is low
        # Normalize both maps to [0, 1] range
        density_gradient_norm = density_gradient / (np.max(density_gradient) + 1e-10)
        velocity_magnitude_norm = velocity_magnitude / (np.max(velocity_magnitude) + 1e-10)
        
        # Low velocity areas contribute more to compression
        low_velocity_weight = 1 - velocity_magnitude_norm
        
        # Combine density gradient and inverse velocity
        lmcs_map = alpha * density_gradient_norm + (1 - alpha) * low_velocity_weight
        
        return lmcs_map

    def calculate_density_gradient(self, density_map: np.ndarray) -> np.ndarray:
        """
        Calculate spatial gradient magnitude of density map
        Args:
            density_map: Normalized density map
        Returns:
            Density gradient magnitude map
        """
        grad_x = sobel(density_map, axis=1)
        grad_y = sobel(density_map, axis=0)
        density_gradient = np.sqrt(grad_x**2 + grad_y**2)
        return density_gradient

    def calculate_acceleration_spike_map(self, velocity_fields: list) -> np.ndarray:
        """
        Calculate temporal velocity changes (Δv) - acceleration spikes
        Args:
            velocity_fields: List of velocity magnitude maps from consecutive frames
        Returns:
            Acceleration spike map
        """
        if len(velocity_fields) < 2:
            return np.zeros_like(velocity_fields[0]) if len(velocity_fields) > 0 else np.zeros((1, 1))
        
        # Ensure all fields have the same shape as the last one
        target_shape = velocity_fields[-1].shape
        valid_fields = [f for f in velocity_fields if f.shape == target_shape]
        
        if len(valid_fields) < 2:
            return np.zeros(target_shape)
        
        # Calculate acceleration as change in velocity between frames
        acceleration_maps = []
        for i in range(1, len(valid_fields)):
            # Difference in velocity magnitude between consecutive frames
            vel_diff = valid_fields[i] - valid_fields[i-1]
            # Take absolute value to get magnitude of change
            abs_vel_diff = np.abs(vel_diff)
            acceleration_maps.append(abs_vel_diff)
        
        # Average the acceleration maps to get a single map
        # np.stack then np.mean is safer if shapes are validated
        stacked_accel = np.stack(acceleration_maps)
        avg_acceleration = np.mean(stacked_accel, axis=0)
        
        # Normalize to [0, 1] range
        max_val = np.max(avg_acceleration)
        if max_val > 0:
            avg_acceleration = avg_acceleration / max_val
        
        return avg_acceleration

    def extract_all_features(self, 
                           density_map: np.ndarray, 
                           flow_data: Dict,
                           velocity_fields: list = None) -> Dict:
        """
        Extract all instability features from density map and flow data
        """
        results = {
            'directional_entropy': 0.0,
            'foi_map': np.zeros_like(density_map),
            'lmcs_map': np.zeros_like(density_map),
            'density_grad_map': np.zeros_like(density_map),
            'acceleration_spikes': np.zeros_like(density_map),
            'density_map': density_map
        }
        
        try:
            # 1. Directional entropy
            if 'angle_map' in flow_data:
                results['directional_entropy'] = self.calculate_directional_entropy(flow_data['angle_map'])
            
            # 2. Flow opposition index
            if 'flow_vectors' in flow_data:
                results['foi_map'] = self.calculate_flow_opposition_index(flow_data['flow_vectors'])
            
            # 3. Velocity magnitude from flow
            velocity_magnitude = flow_data.get('magnitude_map', np.zeros_like(density_map))
            
            # 4. Local motion compression score
            # Ensure shapes match before calculation
            if density_map.shape == velocity_magnitude.shape:
                results['lmcs_map'] = self.calculate_local_motion_compression_score(density_map, velocity_magnitude)
            
            # 5. Density gradient
            results['density_grad_map'] = self.calculate_density_gradient(density_map)
            
            # 6. Acceleration spike map
            if velocity_fields and len(velocity_fields) >= 2:
                results['acceleration_spikes'] = self.calculate_acceleration_spike_map(velocity_fields)
                
        except Exception as e:
            print(f"Warning: Partial feature extraction failure: {e}")
            
        return results

    def compute_instability_mask(self, features_dict: Dict, 
                               thresholds: Dict = None) -> np.ndarray:
        """
        Compute binary mask highlighting unstable regions based on features
        Args:
            features_dict: Dictionary containing all extracted features
            thresholds: Dictionary of thresholds for each feature (optional)
        Returns:
            Binary mask indicating unstable regions
        """
        if thresholds is None:
            # Default thresholds based on empirical observations
            thresholds = {
                'foi_threshold': 0.3,
                'lmcs_threshold': 0.5,
                'density_grad_threshold': 0.4,
                'acceleration_threshold': 0.3
            }
        
        # Combine feature maps based on thresholds
        foi_mask = features_dict['foi_map'] > thresholds['foi_threshold']
        lmcs_mask = features_dict['lmcs_map'] > thresholds['lmcs_threshold']
        density_grad_mask = features_dict['density_grad_map'] > thresholds['density_grad_threshold']
        accel_mask = features_dict['acceleration_spikes'] > thresholds['acceleration_threshold']
        
        # Combine masks - instability occurs when multiple features align
        combined_mask = np.logical_or.reduce((
            foi_mask,
            lmcs_mask,
            density_grad_mask,
            accel_mask
        ))
        
        return combined_mask.astype(np.float32)