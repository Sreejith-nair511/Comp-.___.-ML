import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from collections import OrderedDict

# VGG backbone for CSRNet
class VGGBackbone(nn.Module):
    def __init__(self, pretrained=True):
        super(VGGBackbone, self).__init__()
        
        # Standard front-end of CSRNet (first 10 layers of VGG16)
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.Conv2d(256, 512, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.ReLU(inplace=True)
        )
        
        if pretrained:
            # We don't load full VGG16 weights here to avoid dependencies
            # In a real environment, we'd use torchvision.models.vgg16
            pass

    def forward(self, x):
        return self.features(x)

class CSRNet(nn.Module):
    def __init__(self, load_weights=False):
        super(CSRNet, self).__init__()
        self.seen = 0
        self.frontend = VGGBackbone(pretrained=True)
        
        # Dilated backend layers
        self.backend_feat = [512, 512, 512, 256, 128, 64]
        self.backend = make_layers(self.backend_feat, in_channels=512, dilation=True)
        
        # Final output layer
        self.output_layer = nn.Conv2d(64, 1, kernel_size=1)
        
        if load_weights:
            # Initialization logic if weights path provided elsewhere
            pass
        else:
            # Basic initialization
            self._initialize_weights()

    def forward(self, x):
        x = self.frontend(x)
        x = self.backend(x)
        x = self.output_layer(x)
        return x

    def _initialize_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.normal_(m.weight, std=0.01)
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)

def make_layers(cfg, in_channels, batch_norm=False, dilation=False):
    if dilation:
        d_rate = 2
    else:
        d_rate = 1
    layers = []
    for v in cfg:
        if v == 'M':
            layers += [nn.MaxPool2d(kernel_size=2, stride=2)]
        else:
            conv2d = nn.Conv2d(in_channels, v, kernel_size=3, padding=d_rate, dilation=d_rate)
            if batch_norm:
                layers += [conv2d, nn.BatchNorm2d(v), nn.ReLU(inplace=True)]
            else:
                layers += [conv2d, nn.ReLU(inplace=True)]
            in_channels = v
    return nn.Sequential(*layers)

class DensityEstimator:
    def __init__(self, model_path=None, device='cuda' if torch.cuda.is_available() else 'cpu'):
        """
        Initialize CSRNet density estimator
        Args:
            model_path: Path to pretrained model weights
            device: Device to run the model on ('cuda' or 'cpu')
        """
        self.device = device
        self.model = CSRNet(load_weights=model_path is not None)
        
        if model_path:
            checkpoint = torch.load(model_path, map_location=device)
            self.model.load_state_dict(checkpoint)
        
        self.model.to(device)
        self.model.eval()
        
        # Transform for input images
        self.transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                std=[0.229, 0.224, 0.225])
        ])

    def estimate_density(self, frame):
        """
        Process input frame and return normalized density heatmap (0-1)
        Args:
            frame: Input frame as numpy array (H, W, C) or torch tensor
        Returns:
            Density heatmap as numpy array normalized to [0, 1]
        """
        import numpy as np
        import cv2
        
        # Ensure frame is in the right format
        if isinstance(frame, np.ndarray):
            # Handle grayscale or RGBA
            if len(frame.shape) == 2:
                frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2RGB)
            elif frame.shape[2] == 4:
                frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2RGB)
            
            frame_tensor = self.transform(frame).unsqueeze(0)
        else:
            frame_tensor = frame.unsqueeze(0) if len(frame.shape) == 3 else frame
            
        frame_tensor = frame_tensor.to(self.device)
        
        with torch.no_grad():
            output = self.model(frame_tensor)
            # Standard CSRNet doesn't use sigmoid at the end usually, 
            # but we want a 0-1 risk score. However, CSRNet output is often counts.
            # We'll normalize it to a relative density map.
            
            # Move to CPU and convert to numpy
            density_map = output.cpu().squeeze().numpy()
            
            # Normalize to [0, 1] for visualization and downstream CIRI
            denom = (np.max(density_map) - np.min(density_map) + 1e-8)
            density_map = (density_map - np.min(density_map)) / denom
        
        return density_map