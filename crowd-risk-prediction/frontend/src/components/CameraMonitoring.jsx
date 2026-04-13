import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  useTheme,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Camera,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  LocationOn,
  Speed,
  People
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const CameraMonitoring = () => {
  const theme = useTheme();
  const [cameras, setCameras] = useState([]);
  const [unifiedRisk, setUnifiedRisk] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket for live monitoring
    wsRef.current = new WebSocket(`ws://${window.location.hostname}:8000/ws/live-monitor`);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'camera_status') {
        const cameraList = Object.entries(data.cameras).map(([id, status]) => ({
          id,
          ...status
        }));
        setCameras(cameraList);
      }
    };

    // Fetch initial camera data
    fetchCameras();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchCameras = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/cameras/status');
      const data = await response.json();
      const cameraList = Object.entries(data.cameras).map(([id, status]) => ({
        id,
        ...status
      }));
      setCameras(cameraList);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnifiedAnalysis = async () => {
    try {
      const response = await fetch('http://localhost:8000/cameras/analyze', { method: 'POST' });
      const data = await response.json();
      setUnifiedRisk(data.unified_analysis);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const getRiskColor = (risk) => {
    if (risk > 0.8) return theme.palette.error.main;
    if (risk > 0.6) return theme.palette.warning.main;
    if (risk > 0.3) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  const getRiskLabel = (risk) => {
    if (risk > 0.8) return 'Critical';
    if (risk > 0.6) return 'High';
    if (risk > 0.3) return 'Medium';
    return 'Low';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Multi-Camera Monitoring
          </Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchCameras} disabled={isLoading}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Run Analysis">
              <IconButton onClick={fetchUnifiedAnalysis} color="primary">
                <Speed />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Unified Risk Score */}
        {unifiedRisk && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                border: `2px solid ${getRiskColor(unifiedRisk.unified_risk)}`,
                bgcolor: `${getRiskColor(unifiedRisk.unified_risk)}10`
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Unified Risk Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: getRiskColor(unifiedRisk.unified_risk) }}>
                  {(unifiedRisk.unified_risk * 100).toFixed(1)}%
                </Typography>
                <Chip
                  label={getRiskLabel(unifiedRisk.unified_risk)}
                  sx={{
                    bgcolor: getRiskColor(unifiedRisk.unified_risk),
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={unifiedRisk.unified_risk * 100}
                sx={{
                  mt: 2,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getRiskColor(unifiedRisk.unified_risk)
                  }
                }}
              />
            </Box>
          </motion.div>
        )}

        {/* Camera Grid */}
        <Grid container spacing={2}>
          {cameras.map((camera, index) => (
            <Grid item xs={12} sm={6} md={4} key={camera.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  variant="outlined"
                  sx={{
                    border: `2px solid ${camera.status === 'connected' ? theme.palette.success.main : theme.palette.error.main}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Camera color={camera.status === 'connected' ? 'success' : 'error'} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {camera.id}
                        </Typography>
                      </Box>
                      <Chip
                        label={camera.status}
                        size="small"
                        color={camera.status === 'connected' ? 'success' : 'error'}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          FPS
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {camera.fps?.toFixed(1) || '0.0'}
                        </Typography>
                      </Box>

                      {camera.latest_analysis && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              Risk Score
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: getRiskColor(camera.latest_analysis.risk_score || 0)
                              }}
                            >
                              {((camera.latest_analysis.risk_score || 0) * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {cameras.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No cameras connected. Add cameras to start monitoring.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraMonitoring;
