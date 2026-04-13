"""
Evaluate trained CIRI model accuracy
Measures multiple metrics to ensure >95% accuracy
"""
import torch
import numpy as np
from pathlib import Path
import argparse
from tqdm import tqdm
from torch.utils.data import DataLoader
import yaml

from src.models.ciri_model import CIRIPredictor
from src.models.transformer import SpatioTemporalTransformer
from experiments.train_ciri import CrowdRiskDataset, EnhancedLoss
from src.utils.evaluation_metrics import EvaluationMetrics


def evaluate_model(model, dataloader, criterion, device):
    """Comprehensive model evaluation"""
    model.eval()
    total_loss = 0.0
    num_batches = 0
    
    all_predictions = []
    all_targets = []
    
    evaluator = EvaluationMetrics()
    
    with torch.no_grad():
        for batch in tqdm(dataloader, desc="Evaluating"):
            sequence = batch['sequence'].to(device)
            current_target = batch['current_target'].to(device)
            future_target = batch['future_target'].to(device)
            
            # Forward pass
            outputs = model(sequence, return_intermediates=False)
            current_pred = outputs['current_risk']
            future_pred = outputs['future_risk']
            
            # Calculate loss
            loss = criterion(current_pred, future_pred, current_target, future_target)
            total_loss += loss.item()
            num_batches += 1
            
            # Collect predictions and targets for metric calculation
            all_predictions.append(current_pred.cpu().numpy())
            all_targets.append(current_target.cpu().numpy())
    
    avg_loss = total_loss / num_batches
    
    # Flatten arrays for metrics
    all_predictions = np.concatenate(all_predictions).flatten()
    all_targets = np.concatenate(all_targets).flatten()
    
    # Calculate comprehensive metrics
    # Binary classification (threshold at 0.5)
    y_true_binary = (all_targets > 0.5).astype(int)
    y_pred_scores = all_predictions
    
    metrics = {}
    metrics['loss'] = avg_loss
    
    # Pixel-wise accuracy
    y_pred_binary = (all_predictions > 0.5).astype(int)
    pixel_accuracy = np.mean(y_pred_binary == y_true_binary)
    metrics['pixel_accuracy'] = pixel_accuracy
    
    # AUC-ROC
    try:
        metrics['auc_roc'] = evaluator.calculate_auc(y_true_binary, y_pred_scores)
    except:
        metrics['auc_roc'] = 0.5
    
    # Precision, Recall, F1
    precision, recall, f1 = evaluator.calculate_precision_recall_f1(
        y_true_binary, y_pred_scores, threshold=0.5
    )
    metrics['precision'] = precision
    metrics['recall'] = recall
    metrics['f1_score'] = f1
    
    # MAE and MSE
    mae, mse = evaluator.calculate_mae_mse(all_targets, all_predictions)
    metrics['mae'] = mae
    metrics['mse'] = mse
    
    # Correlation
    metrics['correlation'] = evaluator.calculate_correlation_coefficient(
        all_targets, all_predictions
    )
    
    # Accuracy at different thresholds
    for threshold in [0.4, 0.5, 0.6, 0.7]:
        y_pred_t = (all_predictions > threshold).astype(int)
        y_true_t = (all_targets > threshold).astype(int)
        acc_t = np.mean(y_pred_t == y_true_t)
        metrics[f'accuracy_threshold_{threshold}'] = acc_t
    
    return metrics


def main():
    parser = argparse.ArgumentParser(description='Evaluate CIRI model accuracy')
    parser.add_argument('--model-path', type=str, required=True,
                        help='Path to trained model checkpoint')
    parser.add_argument('--config', type=str, default='configs/training_config.yaml',
                        help='Path to training configuration file')
    parser.add_argument('--batch-size', type=int, default=8,
                        help='Batch size for evaluation')
    parser.add_argument('--device', type=str, default='cuda' if torch.cuda.is_available() else 'cpu',
                        help='Device to evaluate on')
    parser.add_argument('--num-samples', type=int, default=1000,
                        help='Number of evaluation samples')
    
    args = parser.parse_args()
    
    # Load configuration
    config_path = Path(args.config)
    if config_path.exists():
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
    else:
        config = {
            'model': {
                'input_channels': 6,
                'seq_length': 8,
                'embed_dim': 512,
                'num_heads': 8,
                'num_layers': 8,
                'dropout': 0.15
            }
        }
    
    # Set device
    device = torch.device(args.device)
    print(f"Using device: {device}")
    
    # Load model
    print(f"\nLoading model from {args.model_path}...")
    checkpoint = torch.load(args.model_path, map_location=device)
    
    transformer = SpatioTemporalTransformer(
        input_channels=config['model']['input_channels'],
        seq_length=config['model']['seq_length'],
        embed_dim=config['model']['embed_dim'],
        num_heads=config['model']['num_heads'],
        num_layers=config['model']['num_layers'],
        dropout=config['model'].get('dropout', 0.15)
    )
    
    model = CIRIPredictor(transformer_model=transformer).to(device)
    model.load_state_dict(checkpoint['model_state_dict'])
    print(f"Model loaded from epoch {checkpoint['epoch']}")
    print(f"Training loss: {checkpoint['train_loss']:.6f}")
    print(f"Validation loss: {checkpoint['val_loss']:.6f}")
    
    # Initialize loss function
    criterion = EnhancedLoss(
        future_weight=0.5,
        current_weight=0.5,
        focal_alpha=0.25,
        focal_gamma=2.0,
        ssim_weight=0.2
    ).to(device)
    
    # Load evaluation dataset
    print(f"\nLoading evaluation dataset ({args.num_samples} samples)...")
    eval_dataset = CrowdRiskDataset(
        data_path="data/test",
        num_samples=args.num_samples,
        transform=None  # No augmentation for evaluation
    )
    
    eval_loader = DataLoader(
        eval_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=4,
        pin_memory=True
    )
    
    # Evaluate model
    print("\n" + "="*60)
    print("EVALUATING MODEL PERFORMANCE")
    print("="*60)
    
    metrics = evaluate_model(model, eval_loader, criterion, device)
    
    # Print results
    print("\n" + "="*60)
    print("EVALUATION RESULTS")
    print("="*60)
    print(f"Loss: {metrics['loss']:.6f}")
    print(f"\nAccuracy Metrics:")
    print(f"  Pixel Accuracy (threshold=0.5): {metrics['pixel_accuracy']*100:.2f}%")
    print(f"  Accuracy (threshold=0.4): {metrics['accuracy_threshold_0.4']*100:.2f}%")
    print(f"  Accuracy (threshold=0.5): {metrics['accuracy_threshold_0.5']*100:.2f}%")
    print(f"  Accuracy (threshold=0.6): {metrics['accuracy_threshold_0.6']*100:.2f}%")
    print(f"  Accuracy (threshold=0.7): {metrics['accuracy_threshold_0.7']*100:.2f}%")
    
    print(f"\nClassification Metrics:")
    print(f"  AUC-ROC: {metrics['auc_roc']:.4f}")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall: {metrics['recall']:.4f}")
    print(f"  F1-Score: {metrics['f1_score']:.4f}")
    
    print(f"\nRegression Metrics:")
    print(f"  MAE: {metrics['mae']:.6f}")
    print(f"  MSE: {metrics['mse']:.6f}")
    print(f"  Correlation: {metrics['correlation']:.4f}")
    
    # Check if accuracy target is met
    print("\n" + "="*60)
    if metrics['pixel_accuracy'] >= 0.95:
        print(f"✓ TARGET ACHIEVED: {metrics['pixel_accuracy']*100:.2f}% accuracy (>95%)")
    else:
        print(f"✗ Target not met: {metrics['pixel_accuracy']*100:.2f}% accuracy (<95%)")
        print("  Recommendation: Train for more epochs or increase dataset size")
    print("="*60)


if __name__ == "__main__":
    main()
