import cv2
import numpy as np
import torch
from typing import Tuple, Optional

class OpticalFlowProcessor:
    def __init__(self, method='farneback'):
        """
        Initialize optical flow processor
        Args:
            method: 'farneback' for OpenCV implementation or 'raft' for RAFT (placeholder for now)
        """
        self.method = method
        if method == 'farneback':
            # Farneback parameters
            self.prev_frame = None
        elif method == 'raft':
            # In a real implementation, we would initialize RAFT here
            # For now, we'll use Farneback as fallback since RAFT requires additional dependencies
            print("RAFT not fully implemented in this version, using Farneback as default")
            self.method = 'farneback'
            self.prev_frame = None

    def compute_flow(self, prev_frame: np.ndarray, curr_frame: np.ndarray) -> dict:
        """
        Compute optical flow between two frames
        Args:
            prev_frame: Previous frame as grayscale numpy array
            curr_frame: Current frame as grayscale numpy array
        Returns:
            Dictionary containing flow vectors, magnitude map, and direction clusters
        """
        if len(prev_frame.shape) == 3:
            prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
        else:
            prev_gray = prev_frame

        if len(curr_frame.shape) == 3:
            curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)
        else:
            curr_gray = curr_frame

        if self.method == 'farneback':
            # Calculate dense optical flow using Farneback method
            flow = cv2.calcOpticalFlowFarneback(
                prev_gray, curr_gray, None, 
                pyr_scale=0.5, 
                levels=3, 
                winsize=15, 
                iterations=3, 
                poly_n=5, 
                poly_sigma=1.2, 
                flags=0
            )

            # Compute magnitude and angle
            magnitude, angle = cv2.cartToPolar(flow[..., 0], flow[..., 1])

            # Compute direction clusters using k-means
            direction_clusters = self._compute_direction_clusters(angle)

            return {
                'flow_vectors': flow,
                'magnitude_map': magnitude,
                'angle_map': angle,
                'direction_clusters': direction_clusters
            }

    def _compute_direction_clusters(self, angle_map: np.ndarray, k: int = 8) -> np.ndarray:
        """
        Compute direction clusters using fast quantization into 8 bins
        Args:
            angle_map: Angle map from optical flow [0, 2*pi]
            k: Number of bins (default 8)
        Returns:
            Cluster labels for each pixel
        """
        # Linear quantization of angles into k bins
        # Normalized angles to [0, 1]
        norm_angles = angle_map / (2 * np.pi)
        
        # Quantize into k bins
        cluster_map = (norm_angles * k).astype(np.int32)
        cluster_map = np.clip(cluster_map, 0, k - 1)
        
        return cluster_map

    def compute_velocity_variance(self, flow_vectors: np.ndarray, window_size: int = 32) -> np.ndarray:
        """
        Calculate local velocity variance in sliding windows using vectorized operations
        Args:
            flow_vectors: Flow vectors from optical flow computation (H, W, 2)
            window_size: Size of the sliding window
        Returns:
            Velocity variance map
        """
        # Calculate velocity magnitude: sqrt(u^2 + v^2)
        vel_mag = np.sqrt(flow_vectors[..., 0]**2 + flow_vectors[..., 1]**2)
        
        # Calculate E[X] and E[X^2] using box filter (average over window)
        # Var(X) = E[X^2] - (E[X])^2
        mean_vel = cv2.boxFilter(vel_mag, -1, (window_size, window_size))
        mean_vel_sq = cv2.boxFilter(vel_mag**2, -1, (window_size, window_size))
        
        var_map = mean_vel_sq - (mean_vel**2)
        
        # Ensure non-negative due to precision issues
        var_map = np.maximum(var_map, 0)
        
        return var_map

    def detect_acceleration_spikes(self, flows: list) -> np.ndarray:
        """
        Detect acceleration spikes (frame-to-frame delta)
        Args:
            flows: List of flow vectors from consecutive frames
        Returns:
            Acceleration spike map
        """
        if len(flows) < 2:
            raise ValueError("Need at least 2 flow frames to compute acceleration")

        # Calculate difference between consecutive flow frames
        acc_spikes = []
        for i in range(1, len(flows)):
            # Calculate the difference in flow between consecutive frames
            flow_diff = np.abs(flows[i] - flows[i-1])
            # Sum the differences in x and y directions
            acc_spike = np.sqrt(np.sum(flow_diff**2, axis=2))
            acc_spikes.append(acc_spike)

        # Average the acceleration spikes over the sequence
        avg_acc_spikes = np.mean(acc_spikes, axis=0)
        return avg_acc_spikes

    def process_frame_pair(self, frame1: np.ndarray, frame2: np.ndarray) -> dict:
        """
        Process a pair of frames to compute optical flow features
        Args:
            frame1: First frame
            frame2: Second frame
        Returns:
            Dictionary with all optical flow features
        """
        flow_data = self.compute_flow(frame1, frame2)
        
        velocity_var = self.compute_velocity_variance(flow_data['flow_vectors'])
        
        return {
            'flow_vectors': flow_data['flow_vectors'],
            'magnitude_map': flow_data['magnitude_map'],
            'angle_map': flow_data['angle_map'],
            'direction_clusters': flow_data['direction_clusters'],
            'velocity_variance': velocity_var
        }


class RAFTOpticalFlow:
    """
    Placeholder class for RAFT optical flow implementation.
    In a real implementation, this would interface with the RAFT model.
    """
    def __init__(self):
        print("RAFT optical flow would be implemented here with a PyTorch model.")
        print("For now, using OpenCV's Farneback method as a substitute.")
        # In a real implementation:
        # self.model = load_RAFT_model()
        # self.model.eval()

    def compute_flow(self, prev_frame: np.ndarray, curr_frame: np.ndarray) -> dict:
        """
        Compute optical flow using RAFT method
        """
        # This is a simplified implementation using OpenCV as placeholder
        # Real RAFT would require loading a specific model
        processor = OpticalFlowProcessor(method='farneback')
        return processor.compute_flow(prev_frame, curr_frame)