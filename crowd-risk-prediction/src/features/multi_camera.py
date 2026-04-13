"""
Multi-Camera Management System
Handles multiple camera streams, synchronization, and unified risk assessment
"""
import cv2
import numpy as np
import torch
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import threading
import queue
import time
from dataclasses import dataclass
from enum import Enum


class CameraStatus(Enum):
    """Camera connection status"""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    PROCESSING = "processing"


@dataclass
class CameraConfig:
    """Configuration for a single camera"""
    camera_id: str
    source: str  # URL, RTSP, or file path
    name: str = ""
    location: str = ""
    fps: int = 30
    width: int = 1920
    height: int = 1080
    enable_analysis: bool = True
    risk_weight: float = 1.0  # Weight for multi-camera aggregation


class CameraStream:
    """Individual camera stream handler"""
    
    def __init__(self, config: CameraConfig):
        self.config = config
        self.cap = None
        self.status = CameraStatus.DISCONNECTED
        self.current_frame = None
        self.frame_lock = threading.Lock()
        self.latest_analysis = None
        self.fps_counter = 0
        self.last_fps_time = time.time()
        self.current_fps = 0.0
        
    def connect(self) -> bool:
        """Connect to camera stream"""
        try:
            self.cap = cv2.VideoCapture(self.config.source)
            if not self.cap.isOpened():
                self.status = CameraStatus.ERROR
                return False
            
            # Set camera properties
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.config.width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.config.height)
            self.cap.set(cv2.CAP_PROP_FPS, self.config.fps)
            
            self.status = CameraStatus.CONNECTED
            return True
        except Exception as e:
            print(f"Error connecting to camera {self.config.camera_id}: {e}")
            self.status = CameraStatus.ERROR
            return False
    
    def read_frame(self) -> Optional[np.ndarray]:
        """Read a single frame from the camera"""
        if not self.cap or self.status != CameraStatus.CONNECTED:
            return None
        
        ret, frame = self.cap.read()
        if ret:
            with self.frame_lock:
                self.current_frame = frame
                self._update_fps()
            return frame
        else:
            self.status = CameraStatus.ERROR
            return None
    
    def _update_fps(self):
        """Update FPS counter"""
        self.fps_counter += 1
        current_time = time.time()
        if current_time - self.last_fps_time >= 1.0:
            self.current_fps = self.fps_counter
            self.fps_counter = 0
            self.last_fps_time = current_time
    
    def release(self):
        """Release camera resources"""
        if self.cap:
            self.cap.release()
            self.status = CameraStatus.DISCONNECTED


class MultiCameraManager:
    """
    Manages multiple camera streams and provides unified analysis
    """
    
    def __init__(self):
        self.cameras: Dict[str, CameraStream] = {}
        self.analysis_results: Dict[str, Dict] = {}
        self.manager_lock = threading.Lock()
        self.is_running = False
        self.analysis_thread = None
        
    def add_camera(self, config: CameraConfig) -> bool:
        """Add a new camera to the system"""
        with self.manager_lock:
            if config.camera_id in self.cameras:
                return False
            
            camera = CameraStream(config)
            if camera.connect():
                self.cameras[config.camera_id] = camera
                print(f"Camera {config.camera_id} added successfully")
                return True
            return False
    
    def remove_camera(self, camera_id: str) -> bool:
        """Remove a camera from the system"""
        with self.manager_lock:
            if camera_id in self.cameras:
                self.cameras[camera_id].release()
                del self.cameras[camera_id]
                if camera_id in self.analysis_results:
                    del self.analysis_results[camera_id]
                return True
            return False
    
    def get_camera_status(self, camera_id: str) -> Optional[Dict]:
        """Get status of a specific camera"""
        if camera_id not in self.cameras:
            return None
        
        camera = self.cameras[camera_id]
        return {
            'camera_id': camera_id,
            'status': camera.status.value,
            'fps': camera.current_fps,
            'has_frame': camera.current_frame is not None,
            'latest_analysis': camera.latest_analysis
        }
    
    def get_all_cameras_status(self) -> Dict[str, Dict]:
        """Get status of all cameras"""
        status = {}
        for camera_id in self.cameras:
            status[camera_id] = self.get_camera_status(camera_id)
        return status
    
    def capture_all_frames(self) -> Dict[str, np.ndarray]:
        """Capture frames from all cameras"""
        frames = {}
        for camera_id, camera in self.cameras.items():
            frame = camera.read_frame()
            if frame is not None:
                frames[camera_id] = frame
        return frames
    
    def compute_unified_risk(self, individual_risks: Dict[str, float]) -> Dict:
        """
        Compute unified risk score from multiple cameras
        Uses weighted average based on camera configuration
        """
        if not individual_risks:
            return {'unified_risk': 0.0, 'camera_risks': {}, 'alert_level': 'low'}
        
        weighted_sum = 0.0
        total_weight = 0.0
        camera_risks = {}
        
        for camera_id, risk_score in individual_risks.items():
            if camera_id in self.cameras:
                weight = self.cameras[camera_id].config.risk_weight
                weighted_sum += risk_score * weight
                total_weight += weight
                camera_risks[camera_id] = risk_score
        
        unified_risk = weighted_sum / total_weight if total_weight > 0 else 0.0
        
        # Determine alert level
        if unified_risk > 0.8:
            alert_level = 'critical'
        elif unified_risk > 0.6:
            alert_level = 'high'
        elif unified_risk > 0.3:
            alert_level = 'medium'
        else:
            alert_level = 'low'
        
        return {
            'unified_risk': float(unified_risk),
            'camera_risks': camera_risks,
            'alert_level': alert_level,
            'timestamp': datetime.now().isoformat()
        }
    
    def start_continuous_analysis(self, analysis_callback):
        """Start continuous analysis in background thread"""
        self.is_running = True
        self.analysis_thread = threading.Thread(
            target=self._analysis_loop,
            args=(analysis_callback,),
            daemon=True
        )
        self.analysis_thread.start()
    
    def stop_continuous_analysis(self):
        """Stop continuous analysis"""
        self.is_running = False
        if self.analysis_thread:
            self.analysis_thread.join(timeout=5.0)
    
    def _analysis_loop(self, analysis_callback):
        """Background loop for continuous analysis"""
        while self.is_running:
            try:
                frames = self.capture_all_frames()
                if frames:
                    results = analysis_callback(frames)
                    with self.manager_lock:
                        self.analysis_results.update(results)
                        
                        # Update camera latest analysis
                        for camera_id, result in results.items():
                            if camera_id in self.cameras:
                                self.cameras[camera_id].latest_analysis = result
                
                time.sleep(0.033)  # ~30 FPS
            except Exception as e:
                print(f"Error in analysis loop: {e}")
                time.sleep(0.1)
    
    def cleanup(self):
        """Release all camera resources"""
        self.stop_continuous_analysis()
        for camera_id in list(self.cameras.keys()):
            self.remove_camera(camera_id)
