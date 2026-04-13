"""
Automated Demo Script for CrowdGuard AI
This script sets up demo data and walks through features for recording
"""
import requests
import time
import json
from typing import Dict

API_BASE = "http://localhost:8000"

class DemoRunner:
    """Automated demo runner for CrowdGuard AI"""
    
    def __init__(self):
        self.api_base = API_BASE
        self.video_id = None
        
    def print_section(self, title: str):
        """Print a formatted section header"""
        print("\n" + "="*60)
        print(f"  {title}")
        print("="*60)
    
    def step(self, description: str):
        """Print a demo step"""
        print(f"\n▶ {description}")
        time.sleep(1)
    
    def success(self, message: str):
        """Print success message"""
        print(f"✅ {message}")
    
    def check_api_status(self):
        """Check if API is running"""
        self.print_section("STEP 1: System Health Check")
        self.step("Checking API status...")
        
        try:
            response = requests.get(f"{self.api_base}/")
            if response.status_code == 200:
                data = response.json()
                self.success(f"API is running: {data['message']}")
                self.success(f"Status: {data['status']}")
                self.success(f"Models loaded: {data['models_loaded']}")
                return True
            else:
                print("❌ API returned error status")
                return False
        except Exception as e:
            print(f"❌ Cannot connect to API: {e}")
            print("   Make sure the backend is running on port 8000")
            return False
    
    def setup_demo_cameras(self):
        """Add demo cameras for multi-camera feature"""
        self.print_section("STEP 2: Setting Up Multi-Camera System")
        
        cameras = [
            {
                'camera_id': 'entrance_main',
                'source': 'rtsp://192.168.1.100:554/stream',
                'name': 'Main Entrance',
                'location': 'Gate A - Primary Entry Point',
                'fps': 30,
                'width': 1920,
                'height': 1080,
                'risk_weight': 1.5
            },
            {
                'camera_id': 'stage_area',
                'source': 'rtsp://192.168.1.101:554/stream',
                'name': 'Stage Area',
                'location': 'Main Stage - High Priority Zone',
                'fps': 30,
                'width': 1920,
                'height': 1080,
                'risk_weight': 2.0
            },
            {
                'camera_id': 'exit_north',
                'source': 'rtsp://192.168.1.102:554/stream',
                'name': 'North Exit',
                'location': 'Emergency Exit North',
                'fps': 30,
                'width': 1920,
                'height': 1080,
                'risk_weight': 1.2
            },
            {
                'camera_id': 'parking_lot',
                'source': 'rtsp://192.168.1.103:554/stream',
                'name': 'Parking Lot',
                'location': 'Vehicle Parking Area',
                'fps': 25,
                'width': 1920,
                'height': 1080,
                'risk_weight': 0.8
            }
        ]
        
        for cam in cameras:
            self.step(f"Adding camera: {cam['name']}")
            try:
                response = requests.post(
                    f"{self.api_base}/cameras/add",
                    params=cam
                )
                if response.status_code == 200:
                    self.success(f"✓ {cam['name']} added successfully")
                else:
                    print(f"   ⚠ Camera may already exist: {cam['camera_id']}")
            except Exception as e:
                print(f"   ⚠ Could not add camera: {e}")
            
            time.sleep(0.5)
        
        # Show all cameras
        self.step("Retrieving all camera statuses...")
        response = requests.get(f"{self.api_base}/cameras/status")
        if response.status_code == 200:
            data = response.json()
            self.success(f"Total cameras in system: {data['total_cameras']}")
    
    def setup_emergency_contacts(self):
        """Add emergency contacts for alert system"""
        self.print_section("STEP 3: Configuring Emergency Alert System")
        
        contacts = [
            {
                'name': 'John Smith - Security Chief',
                'email': 'security.chief@venue.com',
                'phone': '+1-555-0100',
                'role': 'Head of Security',
                'webhook_url': 'https://hooks.slack.com/services/DEMO/SECURITY/WEBHOOK'
            },
            {
                'name': 'Sarah Johnson - Event Manager',
                'email': 'event.manager@venue.com',
                'phone': '+1-555-0200',
                'role': 'Event Coordinator'
            },
            {
                'name': 'Emergency Response Team',
                'email': 'emergency@venue.com',
                'phone': '+1-555-0911',
                'role': 'First Responders'
            }
        ]
        
        for contact in contacts:
            self.step(f"Adding emergency contact: {contact['name']}")
            try:
                response = requests.post(
                    f"{self.api_base}/emergency/add-contact",
                    params=contact
                )
                if response.status_code == 200:
                    self.success(f"✓ {contact['name']} added")
            except Exception as e:
                print(f"   ⚠ Could not add contact: {e}")
            
            time.sleep(0.5)
        
        # Check active alerts
        self.step("Checking active alerts...")
        response = requests.get(f"{self.api_base}/emergency/alerts/active")
        if response.status_code == 200:
            data = response.json()
            self.success(f"Active alerts: {data['count']}")
    
    def test_mobile_api(self):
        """Test mobile API endpoints"""
        self.print_section("STEP 4: Testing Mobile API")
        
        self.step("Fetching mobile dashboard data...")
        try:
            response = requests.get(f"{self.api_base}/api/v1/mobile/dashboard")
            if response.status_code == 200:
                data = response.json()
                self.success("Mobile dashboard endpoint working")
                print(f"   Status: {data['status']}")
                print(f"   Active cameras: {data['active_cameras']}")
                print(f"   Risk level: {data['current_risk_level']}")
        except Exception as e:
            print(f"   ⚠ Mobile API test: {e}")
        
        self.step("Fetching mobile alerts...")
        try:
            response = requests.get(f"{self.api_base}/api/v1/mobile/alerts")
            if response.status_code == 200:
                data = response.json()
                self.success(f"Mobile alerts endpoint working ({data['count']} alerts)")
        except Exception as e:
            print(f"   ⚠ Mobile alerts test: {e}")
        
        self.step("Fetching mobile camera status...")
        try:
            response = requests.get(f"{self.api_base}/api/v1/mobile/cameras")
            if response.status_code == 200:
                data = response.json()
                self.success(f"Mobile cameras endpoint working ({data['count']} cameras)")
        except Exception as e:
            print(f"   ⚠ Mobile cameras test: {e}")
    
    def show_api_documentation(self):
        """Show API documentation info"""
        self.print_section("STEP 5: API Documentation")
        
        print("\n📚 API Documentation available at:")
        print(f"   → {self.api_base}/docs (Swagger UI)")
        print(f"   → {self.api_base}/redoc (ReDoc)")
        
        print("\n🔌 WebSocket Endpoints:")
        print(f"   → ws://localhost:8000/ws/realtime/{{video_id}}")
        print(f"   → ws://localhost:8000/ws/live-monitor")
        
        print("\n📱 Mobile API Endpoints:")
        print(f"   → GET {self.api_base}/api/v1/mobile/dashboard")
        print(f"   → GET {self.api_base}/api/v1/mobile/alerts")
        print(f"   → GET {self.api_base}/api/v1/mobile/cameras")
    
    def run_full_demo(self):
        """Run complete demo sequence"""
        print("\n" + "🎬"*30)
        print("  CROWD GUARD AI - AUTOMATED DEMO SETUP")
        print("  Perfect for recording demo videos!")
        print("🎬"*30)
        
        # Check API
        if not self.check_api_status():
            print("\n❌ Demo cannot proceed. Please start the API server first:")
            print("   cd crowd-risk-prediction")
            print("   uvicorn api.main:app --reload")
            return
        
        time.sleep(1)
        
        # Setup cameras
        self.setup_demo_cameras()
        time.sleep(1)
        
        # Setup emergency contacts
        self.setup_emergency_contacts()
        time.sleep(1)
        
        # Test mobile API
        self.test_mobile_api()
        time.sleep(1)
        
        # Show API docs
        self.show_api_documentation()
        
        # Final instructions
        self.print_section("DEMO RECORDING INSTRUCTIONS")
        print("""
🎥 Ready to Record! Follow these steps:

1. Open your browser to: http://localhost:5173
2. Start your screen recording software
3. Follow the demo video script (see DEMO_VIDEO_GUIDE.md)

📋 Quick Navigation:
   • Video Analysis tab - Upload and analyze videos
   • Multi-Camera tab - View 4 demo cameras added
   • Emergency Alerts tab - View alert system
   • Analytics tab - View advanced metrics

🎯 Key Features to Showcase:
   ✓ Premium dark theme with gradients
   ✓ Glassmorphic cards and animations
   ✓ Real-time risk assessment
   ✓ Multi-camera monitoring
   ✓ Emergency alert management
   ✓ Mobile-responsive API

📊 API Testing:
   • Open: http://localhost:8000/docs
   • Try out different endpoints
   • Test WebSocket connections

⏱️ Suggested Demo Duration: 5-7 minutes

Good luck with your recording! 🎬✨
        """)
        
        self.print_section("DEMO SETUP COMPLETE ✅")


if __name__ == "__main__":
    demo = DemoRunner()
    demo.run_full_demo()
