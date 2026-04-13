"""
Quick training script to achieve >95% accuracy
Run this to train the enhanced model with optimal settings
"""
import subprocess
import sys
from pathlib import Path

def main():
    print("="*70)
    print("CROWD RISK ANALYSIS - MODEL TRAINING (>95% ACCURACY)")
    print("="*70)
    print()
    
    # Check if CUDA is available
    try:
        import torch
        if torch.cuda.is_available():
            device = 'cuda'
            gpu_name = torch.cuda.get_device_name(0)
            print(f"✓ GPU detected: {gpu_name}")
            print(f"  CUDA version: {torch.version.cuda}")
        else:
            device = 'cpu'
            print("⚠ No GPU detected, training on CPU (will be slower)")
        print()
    except ImportError:
        device = 'cpu'
        print("⚠ PyTorch not installed. Please install requirements first.")
        print("  Run: pip install -r requirements.txt")
        sys.exit(1)
    
    # Ask user for training configuration
    print("Training Configuration:")
    print("-" * 70)
    
    epochs = input("Number of epochs [150]: ").strip() or "150"
    batch_size = input("Batch size [8]: ").strip() or "8"
    num_samples = input("Training samples [5000]: ").strip() or "5000"
    learning_rate = input("Learning rate [3e-4]: ").strip() or "3e-4"
    
    output_dir = input("Output directory [outputs/]: ").strip() or "outputs"
    
    print()
    print("="*70)
    print("Starting Training...")
    print("="*70)
    print()
    
    # Build command
    cmd = [
        sys.executable, "experiments/train_ciri.py",
        "--epochs", epochs,
        "--batch-size", batch_size,
        "--learning-rate", learning_rate,
        "--num-samples", num_samples,
        "--output-dir", output_dir,
        "--device", device
    ]
    
    print(f"Command: {' '.join(cmd)}")
    print()
    
    try:
        # Run training
        result = subprocess.run(cmd, check=True)
        
        print()
        print("="*70)
        print("✓ Training completed successfully!")
        print("="*70)
        print()
        
        # Check if model was saved
        model_path = Path(output_dir) / "ciri_model_best.pth"
        if model_path.exists():
            print(f"Best model saved to: {model_path}")
            print()
            print("Next steps:")
            print("1. Evaluate model accuracy:")
            print(f"   python experiments/evaluate_accuracy.py --model-path {model_path}")
            print()
            print("2. Use model in web interface:")
            print("   cd frontend-next && npm run dev")
        else:
            print("⚠ Model checkpoint not found. Check training logs for errors.")
        
    except subprocess.CalledProcessError as e:
        print()
        print("="*70)
        print("✗ Training failed!")
        print("="*70)
        print(f"Error code: {e.returncode}")
        print("Check the error messages above for details.")
        sys.exit(1)
    except KeyboardInterrupt:
        print()
        print()
        print("="*70)
        print("Training interrupted by user")
        print("="*70)
        print("Partial checkpoints may be available in the output directory.")
        sys.exit(1)

if __name__ == "__main__":
    main()
