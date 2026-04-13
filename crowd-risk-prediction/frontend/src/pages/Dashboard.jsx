import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab
} from '@mui/material';
import {
  VideoLibrary,
  Assessment,
  Timeline,
  Warning,
  CheckCircle,
  Error,
  Info,
  Settings,
  Refresh,
  CloudUpload,
  Speed,
  Memory,
  CameraAlt,
  NotificationsActive
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import VideoPlayer from '../components/VideoPlayer';
import HeatmapOverlay from '../components/HeatmapOverlay';
import TimelineGraph from '../components/TimelineGraph';
import EnhancedTimelineGraph from '../components/EnhancedTimelineGraph';
import ControlPanel from '../components/ControlPanel';
import EnhancedControlPanel from '../components/EnhancedControlPanel';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import CameraMonitoring from '../components/CameraMonitoring';
import EmergencyAlerts from '../components/EmergencyAlerts';
import './Dashboard.css';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabValue, setTabValue] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [riskHeatmap, setRiskHeatmap] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('full');
  const [videoInfo, setVideoInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(() => {
    // Load from localStorage if available
    const savedResults = localStorage.getItem('analysisResults');
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        // Ensure risk_timeline is an array
        if (parsed.risk_timeline && Array.isArray(parsed.risk_timeline)) {
          return parsed;
        }
        // If it's just an array of results
        if (Array.isArray(parsed)) {
          return { risk_timeline: parsed };
        }
      } catch (e) {
        console.error('Error parsing saved results:', e);
      }
    }
    return null;
  });
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    memory: 68,
    gpu: 32,
    fps: 28.5
  });

  // Generate mock data for demonstration
  const mockRiskTimeline = Array.from({ length: 200 }, (_, i) => ({
    frame: i,
    ciri_score: Math.random() * 0.9 + 0.05,
    risk_level: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
  }));

  useEffect(() => {
    // Simulate loading analysis results
    setIsLoading(true);
    setTimeout(() => {
      setAnalysisResults(mockRiskTimeline);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleFrameChange = (frameNumber) => {
    setCurrentFrame(frameNumber);
    
    if (analysisResults) {
      const frameResult = analysisResults[frameNumber] || analysisResults[0];
      const riskValue = frameResult ? frameResult.ciri_score : 0.5;
      
      const mockHeatmap = generateMockHeatmap(480, 640, riskValue);
      setRiskHeatmap(mockHeatmap);
    }
  };

  const generateMockHeatmap = (height, width, riskLevel) => {
    const heatmap = [];
    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
        let value = Math.random() * 0.2;
        
        if (Math.random() < riskLevel * 0.15) {
          const centerX = width / 2 + (Math.random() - 0.5) * width / 3;
          const centerY = height / 2 + (Math.random() - 0.5) * height / 3;
          const dist = Math.sqrt(Math.pow(j - centerX, 2) + Math.pow(i - centerY, 2));
          
          if (dist < 60) {
            value = riskLevel * (1 - dist / 60);
          }
        }
        
        row.push(Math.min(1.0, value));
      }
      heatmap.push(row);
    }
    return heatmap;
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  const getRiskLevelLabel = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'High Risk';
      case 'medium': return 'Medium Risk';
      case 'low': return 'Low Risk';
      default: return 'Unknown';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0a0e27',
      backgroundImage: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1429 100%)',
      color: 'text.primary',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(78, 68, 198, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }
    }}>
      {/* Premium Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.95) 0%, rgba(15, 20, 41, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(120, 119, 198, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              <VideoLibrary sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}
              >
                CrowdGuard AI
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                Intelligent Risk Prediction System
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Live Status Indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#00ff88',
                  boxShadow: '0 0 10px #00ff88',
                  animation: 'pulse 2s infinite'
                }}
              />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                LIVE
              </Typography>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            
            {/* Performance Metrics */}
            <Tooltip title="Processing Speed">
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                px: 2,
                py: 0.75,
                borderRadius: '10px',
                bgcolor: 'rgba(102, 126, 234, 0.15)',
                border: '1px solid rgba(102, 126, 234, 0.3)'
              }}>
                <Speed sx={{ fontSize: 18, color: '#667eea' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, lineHeight: 1.2 }}>
                    {systemStats.fps.toFixed(1)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>
                    FPS
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
            
            <Tooltip title="Memory Usage">
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                px: 2,
                py: 0.75,
                borderRadius: '10px',
                bgcolor: 'rgba(118, 75, 162, 0.15)',
                border: '1px solid rgba(118, 75, 162, 0.3)'
              }}>
                <Memory sx={{ fontSize: 18, color: '#764ba2' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, lineHeight: 1.2 }}>
                    {systemStats.memory}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>
                    RAM
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
            
            <IconButton 
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { 
                  bgcolor: 'rgba(102, 126, 234, 0.2)',
                  color: '#667eea'
                }
              }}
            >
              <Refresh />
            </IconButton>
            
            <IconButton 
              component="a" 
              href="/upload"
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { 
                  bgcolor: 'rgba(102, 126, 234, 0.2)',
                  color: '#667eea'
                }
              }}
            >
              <CloudUpload />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Premium Tab Navigation */}
        <Paper 
          sx={{ 
            mb: 4,
            background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.6) 0%, rgba(15, 20, 41, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(120, 119, 198, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{
              minHeight: 72,
              '& .MuiTab-root': {
                minHeight: 72,
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
                textTransform: 'none',
                letterSpacing: '0.5px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&.Mui-selected': {
                  color: '#667eea',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                },
                '&:hover': {
                  color: 'rgba(255,255,255,0.9)',
                  background: 'rgba(102, 126, 234, 0.1)'
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
              }
            }}
          >
            <Tab 
              icon={<VideoLibrary sx={{ fontSize: 24, mb: 0.5 }} />} 
              iconPosition="top" 
              label="Video Analysis" 
            />
            <Tab 
              icon={<CameraAlt sx={{ fontSize: 24, mb: 0.5 }} />} 
              iconPosition="top" 
              label="Multi-Camera" 
            />
            <Tab 
              icon={<NotificationsActive sx={{ fontSize: 24, mb: 0.5 }} />} 
              iconPosition="top" 
              label="Emergency Alerts" 
            />
            <Tab 
              icon={<Assessment sx={{ fontSize: 24, mb: 0.5 }} />} 
              iconPosition="top" 
              label="Analytics" 
            />
          </Tabs>
        </Paper>

        {/* Enhanced Status Chips */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Chip 
                  icon={<CheckCircle sx={{ color: '#00ff88 !important' }} />} 
                  label="System Online" 
                  sx={{
                    px: 2,
                    py: 2.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    backdropFilter: 'blur(10px)',
                    '& .MuiChip-label': {
                      color: '#00ff88',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }
                  }}
                />
              </motion.div>
            </Grid>
            <Grid item>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Chip 
                  icon={<Info sx={{ color: '#667eea !important' }} />} 
                  label="Analysis Ready" 
                  sx={{
                    px: 2,
                    py: 2.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    backdropFilter: 'blur(10px)',
                    '& .MuiChip-label': {
                      color: '#667eea',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }
                  }}
                />
              </motion.div>
            </Grid>
            <Grid item>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Chip 
                  icon={<Settings sx={{ color: '#764ba2 !important' }} />} 
                  label="AI Model Loaded" 
                  sx={{
                    px: 2,
                    py: 2.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(118, 75, 162, 0.1)',
                    border: '1px solid rgba(118, 75, 162, 0.3)',
                    backdropFilter: 'blur(10px)',
                    '& .MuiChip-label': {
                      color: '#764ba2',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Box>

        {/* Main Dashboard Content - Tabbed */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Video Analysis Section */}
            <Grid item xs={12} lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.7) 0%, rgba(15, 20, 41, 0.7) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(120, 119, 198, 0.2)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: '0 12px 48px rgba(102, 126, 234, 0.2)',
                      border: '1px solid rgba(102, 126, 234, 0.3)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box 
                      sx={{ 
                        p: 3, 
                        borderBottom: '1px solid rgba(120, 119, 198, 0.2)',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, color: 'white' }}>
                            📹 Real-time Video Analysis
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Live crowd monitoring with CIRI-based risk assessment
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            px: 2,
                            py: 1,
                            borderRadius: '10px',
                            bgcolor: 'rgba(0, 255, 136, 0.15)',
                            border: '1px solid rgba(0, 255, 136, 0.3)'
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#00ff88', fontWeight: 700 }}>
                            ● LIVE
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ p: 3 }}>
                      <VideoPlayer 
                        onFrameChange={handleFrameChange}
                        currentFrame={currentFrame}
                        videoSrc="/sample-video.mp4"
                      />
                      
                      {riskHeatmap && (
                        <Box sx={{ mt: 2 }}>
                          <HeatmapOverlay 
                            heatmapData={riskHeatmap} 
                            analysisMode={analysisMode}
                            isVisible={true}
                          />
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Control Panel Section */}
            <Grid item xs={12} lg={4}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <EnhancedControlPanel 
                  systemStats={systemStats}
                  onSettingsChange={(settings) => console.log('Settings:', settings)}
                />
              </motion.div>
            </Grid>

            {/* Timeline and Analytics */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Timeline sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Risk Timeline Analysis
                      </Typography>
                    </Box>
                    
                    <EnhancedTimelineGraph 
                      data={analysisResults || []}
                      isLoading={isLoading}
                      currentFrame={currentFrame}
                      onFrameSelect={(frame) => setCurrentFrame(frame)}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Summary Statistics */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Risk Intelligence Summary
                    </Typography>
                    
                    {isLoading ? (
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress sx={{ borderRadius: '4px', height: 8 }} />
                      </Box>
                    ) : (
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                            <Paper 
                              sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, rgba(255, 71, 87, 0.15) 0%, rgba(255, 107, 129, 0.15) 100%)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(255, 71, 87, 0.4)',
                                borderRadius: '20px',
                                boxShadow: '0 8px 32px rgba(255, 71, 87, 0.2)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  boxShadow: '0 12px 48px rgba(255, 71, 87, 0.3)',
                                  border: '2px solid rgba(255, 71, 87, 0.6)'
                                }
                              }}
                            >
                              <Error sx={{ fontSize: 48, color: '#ff4757', mb: 1.5, filter: 'drop-shadow(0 0 10px rgba(255, 71, 87, 0.5))' }} />
                              <Typography variant="h3" sx={{ fontWeight: 900, color: '#ff4757', mb: 0.5 }}>
                                {analysisResults?.risk_timeline ? 
                                  analysisResults.risk_timeline.filter(r => r.ciri_score > 0.8).length : 
                                  analysisResults ? 
                                    (Array.isArray(analysisResults) ? 
                                      analysisResults.filter(r => r.ciri_score > 0.8).length : 0) : 0}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                                Critical Events
                              </Typography>
                            </Paper>
                          </motion.div>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                            <Paper 
                              sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, rgba(255, 165, 2, 0.15) 0%, rgba(255, 193, 7, 0.15) 100%)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(255, 165, 2, 0.4)',
                                borderRadius: '20px',
                                boxShadow: '0 8px 32px rgba(255, 165, 2, 0.2)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  boxShadow: '0 12px 48px rgba(255, 165, 2, 0.3)',
                                  border: '2px solid rgba(255, 165, 2, 0.6)'
                                }
                              }}
                            >
                              <Warning sx={{ fontSize: 48, color: '#ffa502', mb: 1.5, filter: 'drop-shadow(0 0 10px rgba(255, 165, 2, 0.5))' }} />
                              <Typography variant="h3" sx={{ fontWeight: 900, color: '#ffa502', mb: 0.5 }}>
                                {analysisResults?.risk_timeline ? 
                                  analysisResults.risk_timeline.filter(r => r.ciri_score > 0.6 && r.ciri_score <= 0.8).length : 
                                  analysisResults ? 
                                    (Array.isArray(analysisResults) ? 
                                      analysisResults.filter(r => r.ciri_score > 0.6 && r.ciri_score <= 0.8).length : 0) : 0}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                                High Risk Events
                              </Typography>
                            </Paper>
                          </motion.div>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                            <Paper 
                              sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(102, 126, 234, 0.4)',
                                borderRadius: '20px',
                                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  boxShadow: '0 12px 48px rgba(102, 126, 234, 0.3)',
                                  border: '2px solid rgba(102, 126, 234, 0.6)'
                                }
                              }}
                            >
                              <Assessment sx={{ fontSize: 48, color: '#667eea', mb: 1.5, filter: 'drop-shadow(0 0 10px rgba(102, 126, 234, 0.5))' }} />
                              <Typography variant="h3" sx={{ fontWeight: 900, color: '#667eea', mb: 0.5 }}>
                                {analysisResults?.risk_timeline ? 
                                  (Math.max(...analysisResults.risk_timeline.map(r => r.ciri_score)).toFixed(2)) : 
                                  analysisResults ? 
                                    (Array.isArray(analysisResults) ? 
                                      (Math.max(...analysisResults.map(r => r.ciri_score)).toFixed(2)) : '0.00') : '0.00'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                                Peak Risk Score
                              </Typography>
                            </Paper>
                          </motion.div>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                            <Paper 
                              sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(46, 213, 115, 0.15) 100%)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(0, 255, 136, 0.4)',
                                borderRadius: '20px',
                                boxShadow: '0 8px 32px rgba(0, 255, 136, 0.2)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  boxShadow: '0 12px 48px rgba(0, 255, 136, 0.3)',
                                  border: '2px solid rgba(0, 255, 136, 0.6)'
                                }
                              }}
                            >
                              <CheckCircle sx={{ fontSize: 48, color: '#00ff88', mb: 1.5, filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))' }} />
                              <Typography variant="h3" sx={{ fontWeight: 900, color: '#00ff88', mb: 0.5 }}>
                                {analysisResults?.risk_timeline ? 
                                  (analysisResults.risk_timeline.reduce((sum, r) => sum + r.ciri_score, 0) / analysisResults.risk_timeline.length).toFixed(2) : 
                                  analysisResults ? 
                                    (Array.isArray(analysisResults) ? 
                                      (analysisResults.reduce((sum, r) => sum + r.ciri_score, 0) / analysisResults.length).toFixed(2) : '0.00') : '0.00'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                                Average Risk
                              </Typography>
                            </Paper>
                          </motion.div>
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CameraMonitoring />
          </motion.div>
        )}

        {tabValue === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EmergencyAlerts />
          </motion.div>
        )}

        {tabValue === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AdvancedAnalytics />
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;