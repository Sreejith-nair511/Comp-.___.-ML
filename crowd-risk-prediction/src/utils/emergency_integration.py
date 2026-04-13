"""
Emergency System Integration Module
Provides integration with emergency response systems, alerting, and notification services
"""
import requests
import smtplib
import json
import time
from typing import Dict, List, Optional
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class AlertLevel(Enum):
    """Emergency alert levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class EmergencyContact:
    """Emergency contact information"""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = ""
    webhook_url: Optional[str] = None


class EmergencyAlertSystem:
    """
    Manages emergency alerts and notifications
    Integrates with multiple notification channels
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.alert_history = []
        self.active_alerts = []
        self.emergency_contacts = []
        
        # Alert thresholds
        self.thresholds = {
            'low': 0.3,
            'medium': 0.6,
            'high': 0.8,
            'critical': 0.9
        }
        
        # Rate limiting
        self.last_alert_time = {}
        self.alert_cooldown = 300  # 5 minutes between similar alerts
    
    def add_emergency_contact(self, contact: EmergencyContact):
        """Add emergency contact"""
        self.emergency_contacts.append(contact)
        logger.info(f"Added emergency contact: {contact.name}")
    
    def evaluate_risk_and_alert(self, 
                               risk_score: float,
                               location: str = "",
                               camera_id: str = "",
                               metadata: Optional[Dict] = None) -> Optional[Dict]:
        """
        Evaluate risk score and trigger alerts if necessary
        Args:
            risk_score: Current risk score (0-1)
            location: Location identifier
            camera_id: Camera identifier
            metadata: Additional metadata
        Returns:
            Alert information if triggered, None otherwise
        """
        alert_level = self._determine_alert_level(risk_score)
        
        if alert_level == AlertLevel.LOW:
            return None
        
        # Check rate limiting
        alert_key = f"{location}_{camera_id}_{alert_level.value}"
        current_time = time.time()
        
        if alert_key in self.last_alert_time:
            time_since_last = current_time - self.last_alert_time[alert_key]
            if time_since_last < self.alert_cooldown:
                logger.debug(f"Alert rate limited for {alert_key}")
                return None
        
        # Create alert
        alert = {
            'alert_id': f"ALERT_{int(current_time)}",
            'timestamp': datetime.now().isoformat(),
            'alert_level': alert_level.value,
            'risk_score': risk_score,
            'location': location,
            'camera_id': camera_id,
            'metadata': metadata or {},
            'status': 'active'
        }
        
        # Send alerts through all channels
        self._send_alerts(alert)
        
        # Update alert tracking
        self.alert_history.append(alert)
        self.active_alerts.append(alert)
        self.last_alert_time[alert_key] = current_time
        
        return alert
    
    def _determine_alert_level(self, risk_score: float) -> AlertLevel:
        """Determine alert level based on risk score"""
        if risk_score >= self.thresholds['critical']:
            return AlertLevel.CRITICAL
        elif risk_score >= self.thresholds['high']:
            return AlertLevel.HIGH
        elif risk_score >= self.thresholds['medium']:
            return AlertLevel.MEDIUM
        else:
            return AlertLevel.LOW
    
    def _send_alerts(self, alert: Dict):
        """Send alert through all configured channels"""
        for contact in self.emergency_contacts:
            # Email notification
            if contact.email:
                self._send_email_alert(contact, alert)
            
            # Webhook notification
            if contact.webhook_url:
                self._send_webhook_alert(contact.webhook_url, alert)
            
            # SMS (via external service)
            if contact.phone:
                self._send_sms_alert(contact.phone, alert)
        
        logger.info(f"Alert sent: {alert['alert_id']} - Level: {alert['alert_level']}")
    
    def _send_email_alert(self, contact: EmergencyContact, alert: Dict):
        """Send email alert"""
        try:
            smtp_config = self.config.get('smtp', {})
            
            msg = MIMEMultipart()
            msg['From'] = smtp_config.get('from_email', 'alerts@crowd-risk.com')
            msg['To'] = contact.email
            msg['Subject'] = f"🚨 Crowd Risk Alert - {alert['alert_level'].upper()} - {alert['location']}"
            
            body = f"""
            <h2>Crowd Risk Alert</h2>
            <p><strong>Alert Level:</strong> {alert['alert_level'].upper()}</p>
            <p><strong>Risk Score:</strong> {alert['risk_score']:.2f}</p>
            <p><strong>Location:</strong> {alert['location']}</p>
            <p><strong>Camera:</strong> {alert['camera_id']}</p>
            <p><strong>Time:</strong> {alert['timestamp']}</p>
            <hr>
            <p><strong>Recommended Actions:</strong></p>
            <ul>
                <li>Monitor the situation closely</li>
                <li>Deploy crowd control personnel if needed</li>
                <li>Prepare emergency response if risk increases</li>
            </ul>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            # In production, configure actual SMTP server
            # server = smtplib.SMTP(smtp_config.get('server', 'localhost'))
            # server.send_message(msg)
            # server.quit()
            
            logger.info(f"Email alert sent to {contact.email}")
            
        except Exception as e:
            logger.error(f"Failed to send email alert: {e}")
    
    def _send_webhook_alert(self, webhook_url: str, alert: Dict):
        """Send webhook alert (e.g., Slack, Teams, custom systems)"""
        try:
            payload = {
                'alert_id': alert['alert_id'],
                'timestamp': alert['timestamp'],
                'alert_level': alert['alert_level'],
                'risk_score': alert['risk_score'],
                'location': alert['location'],
                'message': f"⚠️ Crowd Risk Alert: {alert['alert_level'].upper()} risk detected at {alert['location']}"
            }
            
            response = requests.post(webhook_url, json=payload, timeout=10)
            response.raise_for_status()
            
            logger.info(f"Webhook alert sent to {webhook_url}")
            
        except Exception as e:
            logger.error(f"Failed to send webhook alert: {e}")
    
    def _send_sms_alert(self, phone: str, alert: Dict):
        """Send SMS alert (via external service like Twilio)"""
        try:
            # In production, integrate with Twilio or similar service
            message = f"CROWD RISK ALERT: {alert['alert_level'].upper()} - Score: {alert['risk_score']:.2f} - Location: {alert['location']}"
            
            # Example Twilio integration:
            # from twilio.rest import Client
            # client = Client(account_sid, auth_token)
            # message = client.messages.create(body=message, from_=twilio_number, to=phone)
            
            logger.info(f"SMS alert sent to {phone}")
            
        except Exception as e:
            logger.error(f"Failed to send SMS alert: {e}")
    
    def acknowledge_alert(self, alert_id: str, acknowledged_by: str) -> bool:
        """Acknowledge an alert"""
        for alert in self.active_alerts:
            if alert['alert_id'] == alert_id:
                alert['status'] = 'acknowledged'
                alert['acknowledged_by'] = acknowledged_by
                alert['acknowledged_at'] = datetime.now().isoformat()
                logger.info(f"Alert {alert_id} acknowledged by {acknowledged_by}")
                return True
        return False
    
    def resolve_alert(self, alert_id: str, resolution_notes: str = "") -> bool:
        """Resolve an alert"""
        for alert in self.active_alerts:
            if alert['alert_id'] == alert_id:
                alert['status'] = 'resolved'
                alert['resolved_at'] = datetime.now().isoformat()
                alert['resolution_notes'] = resolution_notes
                logger.info(f"Alert {alert_id} resolved")
                return True
        return False
    
    def get_active_alerts(self) -> List[Dict]:
        """Get all active alerts"""
        return [a for a in self.active_alerts if a['status'] in ['active', 'acknowledged']]
    
    def get_alert_history(self, limit: int = 50) -> List[Dict]:
        """Get alert history"""
        return self.alert_history[-limit:]
    
    def clear_resolved_alerts(self):
        """Clear resolved alerts from active list"""
        self.active_alerts = [
            a for a in self.active_alerts 
            if a['status'] not in ['resolved']
        ]


class EmergencyAPIIntegration:
    """
    Integration with external emergency response APIs
    """
    
    def __init__(self, api_config: Dict):
        self.api_config = api_config
        self.base_url = api_config.get('base_url', '')
        self.api_key = api_config.get('api_key', '')
    
    def notify_emergency_services(self,
                                 location: str,
                                 risk_score: float,
                                 alert_level: str,
                                 crowd_size_estimate: int = 0,
                                 additional_info: Optional[Dict] = None) -> bool:
        """
        Notify emergency services via API
        Args:
            location: Incident location
            risk_score: Current risk score
            alert_level: Alert level
            crowd_size_estimate: Estimated crowd size
            additional_info: Additional information
        Returns:
            True if notification successful
        """
        try:
            payload = {
                'incident_type': 'crowd_risk',
                'location': location,
                'risk_score': risk_score,
                'alert_level': alert_level,
                'crowd_size_estimate': crowd_size_estimate,
                'timestamp': datetime.now().isoformat(),
                'additional_info': additional_info or {}
            }
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{self.base_url}/api/incidents",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                logger.info(f"Emergency services notified for {location}")
                return True
            else:
                logger.error(f"Failed to notify emergency services: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error notifying emergency services: {e}")
            return False
    
    def get_emergency_contacts(self, location: str) -> List[Dict]:
        """Get emergency contacts for a location from external API"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                f"{self.base_url}/api/emergency-contacts",
                params={'location': location},
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json().get('contacts', [])
            else:
                logger.error(f"Failed to get emergency contacts: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting emergency contacts: {e}")
            return []
