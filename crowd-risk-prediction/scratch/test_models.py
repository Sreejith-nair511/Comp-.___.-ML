import torch
import sys
import os

# Add the project root to sys.path
sys.path.append(os.getcwd())

def test_model_init():
    print("Testing model initialization...")
    try:
        from src.models.csrnet import CSRNet
        from src.models.ciri_model import create_default_ciri_predictor
        
        print("Initializing CSRNet...")
        csrnet = CSRNet()
        print("SUCCESS: CSRNet initialized successfully")
        
        print("Initializing CIRI Predictor...")
        predictor = create_default_ciri_predictor()
        print("SUCCESS: CIRI Predictor initialized successfully")
        
        # Test forward pass with dummy data
        print("Testing dummy forward pass...")
        dummy_input = torch.randn(1, 3, 224, 224)
        output = csrnet(dummy_input)
        print(f"CSRNet output shape: {output.shape}")
        
        print("SUCCESS: Basic model verification PASSED")
        return True
    except Exception as e:
        print(f"FAILURE: Model verification FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_model_init()
