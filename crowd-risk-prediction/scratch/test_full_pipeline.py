import torch
import numpy as np
import cv2
import os
import sys

# Add the project root to sys.path
sys.path.append(os.getcwd())

def test_analysis_step():
    print("Testing full analysis step...")
    try:
        from src.models.csrnet import DensityEstimator
        from src.features.optical_flow import OpticalFlowProcessor
        from src.features.instability_features import InstabilityFeatures
        from src.models.ciri_model import create_default_ciri_predictor
        
        device = 'cpu'
        density_estimator = DensityEstimator(device=device)
        optical_flow = OpticalFlowProcessor(method='farneback')
        instability_features = InstabilityFeatures()
        ciri_predictor = create_default_ciri_predictor()
        ciri_predictor.to(device)
        ciri_predictor.eval()
        
        # Load a real frame if possible, or use dummy
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        prev_frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        print("1. Density estimation...")
        density_map = density_estimator.estimate_density(frame)
        print(f"   Density map shape: {density_map.shape}")
        
        target_h, target_w = density_map.shape
        
        print("2. Optical flow...")
        prev_small = cv2.resize(prev_frame, (target_w, target_h), interpolation=cv2.INTER_AREA)
        curr_small = cv2.resize(frame, (target_w, target_h), interpolation=cv2.INTER_AREA)
        flow_data = optical_flow.process_frame_pair(prev_small, curr_small)
        print(f"   Flow data keys: {flow_data.keys()}")
        
        print("3. Feature extraction...")
        features = instability_features.extract_all_features(density_map, flow_data)
        print(f"   Features keys: {features.keys()}")
        
        print("4. CIRI prediction...")
        ciri_input = {
            'density_map': torch.from_numpy(features['density_map']).float().to(device).unsqueeze(0),
            'directional_entropy_map': torch.from_numpy(np.full_like(features['density_map'], features['directional_entropy'])).float().to(device).unsqueeze(0),
            'foi_map': torch.from_numpy(features['foi_map']).float().to(device).unsqueeze(0),
            'lmcs_map': torch.from_numpy(features['lmcs_map']).float().to(device).unsqueeze(0),
            'density_grad_map': torch.from_numpy(features['density_grad_map']).float().to(device).unsqueeze(0),
            'acceleration_spikes': torch.from_numpy(features['acceleration_spikes']).float().to(device).unsqueeze(0)
        }
        
        with torch.no_grad():
            ciri_result = ciri_predictor.predict_single_frame(ciri_input)
            print(f"   CIRI result shape: {ciri_result.shape}")
            print(f"   CIRI value: {torch.mean(ciri_result).item()}")
            
        print("SUCCESS: Full analysis step passed!")
        return True
    except Exception as e:
        print(f"FAILURE: Analysis step failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_analysis_step()
