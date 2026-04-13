# Quick Reference: Train Model for >95% Accuracy

## One-Command Training
```bash
cd crowd-risk-prediction
python train_enhanced_model.py
```

## Manual Training Command
```bash
python experiments/train_ciri.py --epochs 150 --batch-size 8 --learning-rate 3e-4 --num-samples 5000
```

## Evaluate Accuracy
```bash
python experiments/evaluate_accuracy.py --model-path outputs/ciri_model_best.pth
```

## What Changed (Quick List)
✓ 5,000 realistic training samples (was 1,000 random)
✓ Enhanced loss: BCE + Focal + SSIM (was BCE only)
✓ Data augmentation: 4x effective dataset
✓ Model size: 512 embed dim, 8 layers (was 256, 6)
✓ Training: 150 epochs, cosine annealing, warmup
✓ Early stopping, gradient clipping, better optimizer

## Expected Results
- **Accuracy**: >95% (target)
- **Training Time**: ~2 hours on GPU
- **Model Size**: ~20MB checkpoint

## If Accuracy < 95%
1. Train longer: `--epochs 200`
2. More data: `--num-samples 10000`
3. Lower LR: `--learning-rate 1e-4`

## Files Created/Modified
- `experiments/train_ciri.py` - Enhanced training
- `experiments/evaluate_accuracy.py` - Evaluation script
- `train_enhanced_model.py` - Quick start script
- `MODEL_ACCURACY_IMPROVEMENTS.md` - Full documentation
- `ACCURACY_IMPROVEMENT_SUMMARY.md` - Summary

## Need Help?
Read: `MODEL_ACCURACY_IMPROVEMENTS.md` for complete guide
