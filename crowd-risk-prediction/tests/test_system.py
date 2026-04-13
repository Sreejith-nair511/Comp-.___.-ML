"""
Comprehensive test suite for Crowd Risk Analysis System
Tests core functionality, API endpoints, and new features
"""
import pytest
import numpy as np
import torch
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.main import app
from src.models.ciri_model import CIRIModel, CIRIPredictor, CIRILoss
from src.features.ciri_calculator import CIRICalculator
from src.features.instability_features import InstabilityFeatures
from src.utils.edge_optimization import ModelOptimizer, EdgeInferenceEngine
from src.utils.emergency_integration import EmergencyAlertSystem, EmergencyContact, AlertLevel


client = TestClient(app)


class TestCIRIModel:
    """Test CIRI model functionality"""
    
    def test_ciri_model_initialization(self):
        """Test CIRI model initializes correctly"""
        model = CIRIModel(num_features=6)
        assert model.num_features == 6
        assert model.learnable_weights is not None
    
    def test_ciri_model_forward(self):
        """Test CIRI model forward pass"""
        model = CIRIModel(num_features=6)
        model.eval()
        
        # Create mock features
        batch_size, height, width = 2, 64, 64
        features_dict = {
            'density_map': torch.rand(batch_size, height, width),
            'directional_entropy_map': torch.rand(batch_size, height, width),
            'foi_map': torch.rand(batch_size, height, width),
            'lmcs_map': torch.rand(batch_size, height, width),
            'density_grad_map': torch.rand(batch_size, height, width),
            'acceleration_spikes': torch.rand(batch_size, height, width)
        }
        
        with torch.no_grad():
            output = model(features_dict)
        
        assert output.shape == (batch_size, height, width)
        assert torch.all(output >= 0) and torch.all(output <= 1)
    
    def test_ciri_model_with_manual_weights(self):
        """Test CIRI model with manual weights"""
        manual_weights = [0.2, 0.15, 0.2, 0.15, 0.15, 0.15]
        model = CIRIModel(num_features=6, manual_weights=manual_weights)
        
        assert model.manual_weights is not None
        assert len(model.manual_weights) == 6
    
    def test_ciri_predictor(self):
        """Test CIRI predictor"""
        predictor = CIRIPredictor(use_temporal_prediction=False)
        predictor.eval()
        
        batch_size, seq_len, height, width, channels = 2, 8, 64, 64, 6
        feature_sequence = torch.rand(batch_size, seq_len, height, width, channels)
        
        with torch.no_grad():
            results = predictor(feature_sequence)
        
        assert 'current_risk' in results
        assert 'future_risk' in results


class TestCIRICalculator:
    """Test CIRI calculator"""
    
    def test_calculate_ciri(self):
        """Test CIRI calculation"""
        calculator = CIRICalculator(device='cpu')
        
        # Create mock data
        density_map = np.random.rand(64, 64).astype(np.float32)
        flow_data = {
            'magnitude_map': np.random.rand(64, 64).astype(np.float32),
            'angle_map': np.random.rand(64, 64).astype(np.float32)
        }
        
        ciri_map, breakdown = calculator.calculate_ciri(density_map, flow_data)
        
        assert ciri_map is not None
        assert breakdown is not None
        assert 'density_contribution' in breakdown
    
    def test_get_risk_level(self):
        """Test risk level classification"""
        calculator = CIRICalculator(device='cpu')
        
        assert calculator.get_risk_level(0.1) == "LOW"
        assert calculator.get_risk_level(0.4) == "MODERATE"
        assert calculator.get_risk_level(0.7) == "HIGH"
        assert calculator.get_risk_level(0.9) == "CRITICAL"


class TestInstabilityFeatures:
    """Test instability feature extraction"""
    
    def test_extract_all_features(self):
        """Test extraction of all instability features"""
        features_calc = InstabilityFeatures()
        
        density_map = np.random.rand(64, 64).astype(np.float32)
        flow_data = {
            'magnitude_map': np.random.rand(64, 64).astype(np.float32),
            'angle_map': np.random.rand(64, 64).astype(np.float32)
        }
        
        features = features_calc.extract_all_features(density_map, flow_data)
        
        assert 'density_map' in features
        assert 'directional_entropy' in features
        assert 'foi_map' in features
        assert 'lmcs_map' in features
        assert 'density_grad_map' in features
        assert 'acceleration_spikes' in features


class TestEdgeOptimization:
    """Test edge device optimization"""
    
    def test_model_optimizer_initialization(self):
        """Test model optimizer initializes"""
        optimizer = ModelOptimizer(device='cpu')
        assert optimizer.device == 'cpu'
    
    def test_quantize_int8(self):
        """Test INT8 quantization"""
        model = CIRIModel(num_features=6)
        optimizer = ModelOptimizer(device='cpu')
        
        quantized_model = optimizer.quantize_model_int8(model)
        assert quantized_model is not None
    
    def test_benchmark_model(self):
        """Test model benchmarking"""
        model = CIRIModel(num_features=6)
        optimizer = ModelOptimizer(device='cpu')
        
        metrics = optimizer.benchmark_model(model, (1, 6, 64, 64), num_iterations=10)
        
        assert 'avg_latency_ms' in metrics
        assert 'fps' in metrics
        assert metrics['fps'] > 0


class TestEmergencyIntegration:
    """Test emergency system integration"""
    
    def test_emergency_system_initialization(self):
        """Test emergency system initializes"""
        system = EmergencyAlertSystem()
        assert system is not None
        assert len(system.emergency_contacts) == 0
    
    def test_add_emergency_contact(self):
        """Test adding emergency contact"""
        system = EmergencyAlertSystem()
        contact = EmergencyContact(
            name="Test User",
            email="test@example.com",
            role="Tester"
        )
        
        system.add_emergency_contact(contact)
        assert len(system.emergency_contacts) == 1
    
    def test_evaluate_risk_and_alert(self):
        """Test risk evaluation and alert generation"""
        system = EmergencyAlertSystem()
        
        # Low risk - should not trigger alert
        result = system.evaluate_risk_and_alert(0.2, "Location 1")
        assert result is None
        
        # High risk - should trigger alert
        result = system.evaluate_risk_and_alert(0.85, "Location 2")
        assert result is not None
        assert result['alert_level'] in ['high', 'critical']
    
    def test_alert_acknowledgment(self):
        """Test alert acknowledgment"""
        system = EmergencyAlertSystem()
        
        # Create an alert
        alert = system.evaluate_risk_and_alert(0.9, "Test Location")
        assert alert is not None
        
        # Acknowledge the alert
        success = system.acknowledge_alert(alert['alert_id'], "Operator 1")
        assert success is True
        
        # Check alert status
        active_alerts = system.get_active_alerts()
        assert len(active_alerts) > 0
    
    def test_alert_resolution(self):
        """Test alert resolution"""
        system = EmergencyAlertSystem()
        
        # Create and resolve an alert
        alert = system.evaluate_risk_and_alert(0.9, "Test Location")
        assert alert is not None
        
        success = system.resolve_alert(alert['alert_id'], "Issue resolved")
        assert success is True


class TestAPIEndpoints:
    """Test API endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["status"] == "running"
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
    
    def test_upload_video_validation(self):
        """Test video upload validation"""
        # Test with invalid file type
        response = client.post(
            "/upload-video/",
            files={"file": ("test.txt", b"test content", "text/plain")}
        )
        assert response.status_code == 400
    
    def test_camera_status(self):
        """Test camera status endpoint"""
        response = client.get("/cameras/status")
        assert response.status_code == 200
        data = response.json()
        assert "cameras" in data
    
    def test_emergency_alerts(self):
        """Test emergency alerts endpoint"""
        response = client.get("/emergency/alerts/active")
        assert response.status_code == 200
        data = response.json()
        assert "active_alerts" in data
    
    def test_mobile_dashboard(self):
        """Test mobile dashboard endpoint"""
        response = client.get("/api/v1/mobile/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "active_cameras" in data


class TestMultiCamera:
    """Test multi-camera functionality"""
    
    def test_camera_manager_initialization(self):
        """Test camera manager initializes"""
        from src.features.multi_camera import MultiCameraManager
        
        manager = MultiCameraManager()
        assert manager is not None
        assert len(manager.cameras) == 0
    
    def test_compute_unified_risk(self):
        """Test unified risk computation"""
        from src.features.multi_camera import MultiCameraManager, CameraConfig
        
        manager = MultiCameraManager()
        
        # Mock individual risks
        individual_risks = {
            'cam1': 0.7,
            'cam2': 0.8,
            'cam3': 0.6
        }
        
        result = manager.compute_unified_risk(individual_risks)
        
        assert 'unified_risk' in result
        assert 'camera_risks' in result
        assert 'alert_level' in result
        assert 0 <= result['unified_risk'] <= 1


class TestVisualization:
    """Test visualization utilities"""
    
    def test_visualize_heatmap(self):
        """Test heatmap visualization"""
        from src.utils.visualization import visualize_heatmap
        
        heatmap = np.random.rand(64, 64).astype(np.float32)
        result = visualize_heatmap(heatmap, "Test Heatmap")
        
        assert result is not None
        assert len(result.shape) == 3  # RGB image
    
    def test_overlay_heatmap_on_frame(self):
        """Test heatmap overlay"""
        from src.utils.visualization import overlay_heatmap_on_frame
        
        frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        heatmap = np.random.rand(480, 640).astype(np.float32)
        
        result = overlay_heatmap_on_frame(frame, heatmap)
        
        assert result is not None
        assert result.shape == frame.shape


@pytest.fixture
def sample_density_map():
    """Fixture for sample density map"""
    return np.random.rand(64, 64).astype(np.float32)


@pytest.fixture
def sample_flow_data():
    """Fixture for sample flow data"""
    return {
        'magnitude_map': np.random.rand(64, 64).astype(np.float32),
        'angle_map': np.random.rand(64, 64).astype(np.float32)
    }


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
