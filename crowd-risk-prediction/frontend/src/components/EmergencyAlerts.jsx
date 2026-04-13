import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  useTheme,
  Divider
} from '@mui/material';
import {
  Warning,
  Error,
  CheckCircle,
  Notifications,
  LocationOn,
  AccessTime,
  Person,
  Delete,
  Add
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const EmergencyAlerts = () => {
  const theme = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [openAddContact, setOpenAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    webhook_url: ''
  });

  useEffect(() => {
    fetchAlerts();
    fetchContacts();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:8000/emergency/alerts/active');
      const data = await response.json();
      setAlerts(data.active_alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchContacts = async () => {
    // In production, fetch from API
    // For now, use mock data
    setContacts([]);
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await fetch(
        `http://localhost:8000/emergency/alerts/${alertId}/acknowledge?acknowledged_by=Operator`,
        { method: 'POST' }
      );
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await fetch(
        `http://localhost:8000/emergency/alerts/${alertId}/resolve?resolution_notes=Resolved+by+operator`,
        { method: 'POST' }
      );
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleAddContact = async () => {
    try {
      const params = new URLSearchParams(newContact).toString();
      await fetch(`http://localhost:8000/emergency/add-contact?${params}`, {
        method: 'POST'
      });
      setOpenAddContact(false);
      setNewContact({ name: '', email: '', phone: '', role: '', webhook_url: '' });
      fetchContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'critical':
        return <Error sx={{ color: 'error.main', fontSize: 32 }} />;
      case 'high':
        return <Warning sx={{ color: 'warning.main', fontSize: 32 }} />;
      case 'medium':
        return <Notifications sx={{ color: 'info.main', fontSize: 32 }} />;
      default:
        return <CheckCircle sx={{ color: 'success.main', fontSize: 32 }} />;
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'critical':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.warning.main;
      case 'medium':
        return theme.palette.info.main;
      default:
        return theme.palette.success.main;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Emergency Alerts
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setOpenAddContact(true)}
          >
            Add Contact
          </Button>
        </Box>

        {/* Alert Summary */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Alert severity="error" variant="outlined">
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {alerts.filter(a => a.alert_level === 'critical').length}
                </Typography>
                <Typography variant="caption">Critical</Typography>
              </Alert>
            </Grid>
            <Grid item xs={4}>
              <Alert severity="warning" variant="outlined">
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {alerts.filter(a => a.alert_level === 'high').length}
                </Typography>
                <Typography variant="caption">High</Typography>
              </Alert>
            </Grid>
            <Grid item xs={4}>
              <Alert severity="info" variant="outlined">
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {alerts.filter(a => a.alert_level === 'medium').length}
                </Typography>
                <Typography variant="caption">Medium</Typography>
              </Alert>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Active Alerts List */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Active Alerts
        </Typography>

        {alerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No active alerts. System is operating normally.
            </Typography>
          </Box>
        ) : (
          <List>
            <AnimatePresence>
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.alert_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ListItem
                    sx={{
                      mb: 2,
                      border: `2px solid ${getAlertColor(alert.alert_level)}`,
                      borderRadius: 2,
                      bgcolor: `${getAlertColor(alert.alert_level)}08`
                    }}
                  >
                    <ListItemIcon>
                      {getAlertIcon(alert.alert_level)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={alert.alert_level.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: getAlertColor(alert.alert_level),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {alert.alert_id}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2">
                              {alert.location || 'Unknown Location'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="body2">
                              {new Date(alert.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Risk Score: {(alert.risk_score * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {alert.status === 'active' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleAcknowledge(alert.alert_id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      {(alert.status === 'active' || alert.status === 'acknowledged') && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleResolve(alert.alert_id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        )}

        {/* Add Contact Dialog */}
        <Dialog open={openAddContact} onClose={() => setOpenAddContact(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Emergency Contact</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Name"
                fullWidth
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
              <TextField
                label="Email"
                fullWidth
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />
              <TextField
                label="Phone"
                fullWidth
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />
              <TextField
                label="Role"
                fullWidth
                value={newContact.role}
                onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
              />
              <TextField
                label="Webhook URL (optional)"
                fullWidth
                value={newContact.webhook_url}
                onChange={(e) => setNewContact({ ...newContact, webhook_url: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddContact(false)}>Cancel</Button>
            <Button onClick={handleAddContact} variant="contained">
              Add Contact
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EmergencyAlerts;
