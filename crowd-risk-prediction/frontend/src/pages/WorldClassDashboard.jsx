import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Container,
  useTheme,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
  Upload,
  Analytics,
  Psychology,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Speed,
  Memory,
  Storage,
  Science,
  AutoGraph,
  ModelTraining,
  Timeline,
  ShowChart,
  BubbleChart,
  ScatterPlot,
  Assessment,
  ViewModule,
  DonutLarge
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

// Generate cluster data
const generateClusterData = () => {
  const clusters = [];
  for (let i = 0; i < 200; i++) {
    const cluster = Math.floor(Math.random() * 5);
    clusters.push({
      x: cluster * 20 + Math.random() * 15,
      y: cluster * 15 + Math.random() * 20,
      z: Math.random() * 100,
      cluster: `Cluster ${cluster + 1}`,
      risk: Math.random()
    });
  }
  return clusters;
};

// Generate PCA components
const generatePCAData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    component: `PC${i + 1}`,
    variance: Math.exp(-i * 0.15) * 100,
    cumulative: (1 - Math.exp(-i * 0.15)) * 100
  }));
};

// Generate confusion matrix
const generateConfusionMatrix = () => {
  const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  const matrix = [];
  labels.forEach((actual, i) => {
    labels.forEach((predicted, j) => {
      matrix.push({
        actual,
        predicted,
        value: i === j ? 85 + Math.random() * 10 : Math.random() * 8
      });
    });
  });
  return matrix;
};

// Generate correlation data
const generateCorrelationData = () => {
  const features = ['Density', 'Motion', 'Entropy', 'Flow', 'Gradient', 'Temporal'];
  const correlations = [];
  features.forEach((f1, i) => {
    features.forEach((f2, j) => {
      correlations.push({
        feature1: f1,
        feature2: f2,
        correlation: i === j ? 1 : (Math.random() * 2 - 1)
      });
    });
  });
  return correlations;
};

// Generate feature importance
const generateFeatureImportance = () => {
  return [
    { feature: 'Mean Density', importance: 0.92 },
    { feature: 'Motion Magnitude', importance: 0.87 },
    { feature: 'Directional Entropy', importance: 0.82 },
    { feature: 'Flow Opposition', importance: 0.78 },
    { feature: 'Density Gradient', importance: 0.75 },
    { feature: 'Motion Compression', importance: 0.71 },
    { feature: 'Acceleration Spikes', importance: 0.68 },
    { feature: 'Temporal Trend', importance: 0.64 },
    { feature: 'Spatial Variance', importance: 0.59 },
    { feature: 'Crowd Velocity', importance: 0.55 }
  ];
};

// Generate model comparison
const generateModelComparison = () => {
  return [
    { metric: 'Accuracy', 'Random Forest': 0.94, 'Gradient Boost': 0.96, 'SVM': 0.89, 'Neural Net': 0.92, 'Logistic Reg': 0.85 },
    { metric: 'Precision', 'Random Forest': 0.93, 'Gradient Boost': 0.95, 'SVM': 0.88, 'Neural Net': 0.91, 'Logistic Reg': 0.84 },
    { metric: 'Recall', 'Random Forest': 0.92, 'Gradient Boost': 0.94, 'SVM': 0.87, 'Neural Net': 0.90, 'Logistic Reg': 0.83 },
    { metric: 'F1-Score', 'Random Forest': 0.93, 'Gradient Boost': 0.95, 'SVM': 0.88, 'Neural Net': 0.91, 'Logistic Reg': 0.84 },
    { metric: 'AUC-ROC', 'Random Forest': 0.96, 'Gradient Boost': 0.98, 'SVM': 0.91, 'Neural Net': 0.94, 'Logistic Reg': 0.87 }
  ];
};

// Generate radar chart data
const generateRadarData = () => {
  return [
    { metric: 'Accuracy', value: 94, fullMark: 100 },
    { metric: 'Speed', value: 87, fullMark: 100 },
    { metric: 'Scalability', value: 92, fullMark: 100 },
    { metric: 'Robustness', value: 89, fullMark: 100 },
    { metric: 'Interpretability', value: 78, fullMark: 100 },
    { metric: 'Generalization', value: 91, fullMark: 100 }
  ];
};

// Generate risk distribution
const generateRiskDistribution = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    risk: i * 2,
    count: Math.floor(Math.exp(-Math.pow(i - 25, 2) / 200) * 100)
  }));
};

const WorldClassDashboard = () => {
  const theme = useTheme();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentRisk, setCurrentRisk] = useState(0.23);
  const [crowdCategory, setCrowdCategory] = useState('Low');
  const [systemMetrics, setSystemMetrics] = useState({
    fps: 28.5,
    memory: 62,
    gpu: 45,
    cpu: 38
  });

  // Mock real-time data
  const [riskTimeline, setRiskTimeline] = useState(() => 
    Array.from({ length: 50 }, (_, i) => ({
      time: i,
      risk: 0.2 + Math.random() * 0.3,
      density: 0.3 + Math.random() * 0.4
    }))
  );

  const [mlPredictions, setMlPredictions] = useState({
    randomForest: 0.75,
    gradientBoosting: 0.82,
    svm: 0.71,
    neuralNetwork: 0.78
  });

  const [crowdComposition, setCrowdComposition] = useState([
    { name: 'Very Low', value: 15 },
    { name: 'Low', value: 35 },
    { name: 'Medium', value: 30 },
    { name: 'High', value: 15 },
    { name: 'Very High', value: 5 }
  ]);

  // New comprehensive data states
  const [clusterData] = useState(generateClusterData());
  const [pcaData] = useState(generatePCAData());
  const [confusionMatrix] = useState(generateConfusionMatrix());
  const [correlationData] = useState(generateCorrelationData());
  const [featureImportance] = useState(generateFeatureImportance());
  const [modelComparison] = useState(generateModelComparison());
  const [radarData] = useState(generateRadarData());
  const [riskDistribution] = useState(generateRiskDistribution());

  const [trainingMetrics, setTrainingMetrics] = useState({
    epoch: 47,
    loss: 0.023,
    accuracy: 0.962,
    valAccuracy: 0.954
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRiskTimeline(prev => {
        const newPoint = {
          time: prev[prev.length - 1].time + 1,
          risk: Math.max(0, Math.min(1, prev[prev.length - 1].risk + (Math.random() - 0.5) * 0.1)),
          density: Math.max(0, Math.min(1, prev[prev.length - 1].density + (Math.random() - 0.5) * 0.08))
        };
        return [...prev.slice(1), newPoint];
      });

      setCurrentRisk(prev => Math.max(0, Math.min(1, prev + (Math.random() - 0.5) * 0.05)));
      
      setSystemMetrics(prev => ({
        fps: Math.max(20, Math.min(35, prev.fps + (Math.random() - 0.5) * 2)),
        memory: Math.max(50, Math.min(80, prev.memory + (Math.random() - 0.5) * 3)),
        gpu: Math.max(30, Math.min(70, prev.gpu + (Math.random() - 0.5) * 5)),
        cpu: Math.max(25, Math.min(60, prev.cpu + (Math.random() - 0.5) * 4))
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (risk) => {
    if (risk > 0.8) return '#ff4757';
    if (risk > 0.6) return '#ffa502';
    if (risk > 0.3) return '#667eea';
    return '#00ff88';
  };

  const getRiskLevel = (risk) => {
    if (risk > 0.8) return 'CRITICAL';
    if (risk > 0.6) return 'HIGH';
    if (risk > 0.3) return 'MODERATE';
    return 'LOW';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1429 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, rgba(240, 147, 251, 0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }
    }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.95) 0%, rgba(15, 20, 41, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(102, 126, 234, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        px: 4,
        py: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)'
            }}>
              <Psychology sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 900,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-1px'
              }}>
                CrowdGuard AI
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Advanced ML-Powered Crowd Analytics
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#00ff88',
                boxShadow: '0 0 10px #00ff88',
                animation: 'pulse 2s infinite'
              }} />
              <Typography sx={{ color: '#00ff88', fontWeight: 700 }}>LIVE</Typography>
            </Box>

            {[
              { icon: Speed, label: 'FPS', value: systemMetrics.fps.toFixed(1), color: '#667eea' },
              { icon: Memory, label: 'RAM', value: `${systemMetrics.memory.toFixed(0)}%`, color: '#764ba2' },
              { icon: Storage, label: 'GPU', value: `${systemMetrics.gpu.toFixed(0)}%`, color: '#f093fb' }
            ].map((metric, idx) => (
              <Box key={idx} sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2.5,
                py: 1,
                borderRadius: '12px',
                bgcolor: `${metric.color}15`,
                border: `1px solid ${metric.color}40`
              }}>
                <metric.icon sx={{ fontSize: 20, color: metric.color }} />
                <Box>
                  <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>
                    {metric.value}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                    {metric.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Status Bar */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[
            { icon: CheckCircle, label: 'AI Models Active', color: '#00ff88' },
            { icon: Science, label: '5 ML Algorithms', color: '#667eea' },
            { icon: ModelTraining, label: 'Real-time Training', color: '#764ba2' },
            { icon: AutoGraph, label: 'PCA Analysis', color: '#f093fb' }
          ].map((status, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Chip
                icon={<status.icon sx={{ color: status.color }} />}
                label={status.label}
                sx={{
                  px: 3,
                  py: 3,
                  borderRadius: '14px',
                  bgcolor: `${status.color}15`,
                  border: `1px solid ${status.color}40`,
                  backdropFilter: 'blur(10px)',
                  '& .MuiChip-label': { color: status.color, fontWeight: 700 }
                }}
              />
            </motion.div>
          ))}
        </Box>

        {/* Main Risk Gauge */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.8) 0%, rgba(15, 20, 41, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${getRiskColor(currentRisk)}60`,
                borderRadius: '24px',
                p: 4,
                textAlign: 'center',
                boxShadow: `0 8px 32px ${getRiskColor(currentRisk)}30`
              }}>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2, fontWeight: 600 }}>
                  Current Risk Level
                </Typography>
                <Typography variant="h1" sx={{ 
                  fontWeight: 900,
                  color: getRiskColor(currentRisk),
                  fontSize: '5rem',
                  textShadow: `0 0 30px ${getRiskColor(currentRisk)}80`
                }}>
                  {(currentRisk * 100).toFixed(1)}%
                </Typography>
                <Chip
                  label={getRiskLevel(currentRisk)}
                  sx={{
                    mt: 2,
                    px: 4,
                    py: 3,
                    borderRadius: '14px',
                    bgcolor: getRiskColor(currentRisk),
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.1rem'
                  }}
                />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 2 }}>
                  Crowd Density: {crowdCategory}
                </Typography>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={8}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.8) 0%, rgba(15, 20, 41, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '24px',
                p: 3,
                height: '100%'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                    📊 Real-Time Risk Analysis
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton sx={{ color: '#00ff88' }}>
                      <PlayArrow />
                    </IconButton>
                    <IconButton sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      <Refresh />
                    </IconButton>
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={riskTimeline}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#764ba2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 1]} />
                    <RechartsTooltip 
                      contentStyle={{ 
                        background: 'rgba(26, 31, 58, 0.95)',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        borderRadius: '12px'
                      }}
                    />
                    <Area type="monotone" dataKey="risk" stroke="#667eea" fillOpacity={1} fill="url(#colorRisk)" />
                    <Area type="monotone" dataKey="density" stroke="#764ba2" fillOpacity={1} fill="url(#colorDensity)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* ML Models Performance */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.8) 0%, rgba(15, 20, 41, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '24px',
                p: 3
              }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
                  🤖 ML Model Predictions (Ensemble)
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Object.entries(mlPredictions).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 1]} />
                    <RechartsTooltip 
                      contentStyle={{ 
                        background: 'rgba(26, 31, 58, 0.95)',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        borderRadius: '12px'
                      }}
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                      {Object.entries(mlPredictions).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.8) 0%, rgba(15, 20, 41, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '24px',
                p: 3,
                height: '100%'
              }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
                  👥 Crowd Composition
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={crowdComposition}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {crowdComposition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Advanced ML Features */}
        <Grid container spacing={3}>
          {[
            {
              title: 'Supervised Learning',
              icon: ModelTraining,
              color: '#667eea',
              items: ['Random Forest', 'Gradient Boosting', 'SVM', 'Neural Networks', 'Logistic Regression']
            },
            {
              title: 'Unsupervised Learning',
              icon: Science,
              color: '#764ba2',
              items: ['K-Means Clustering', 'DBSCAN', 'Isolation Forest', 'PCA', 'Anomaly Detection']
            },
            {
              title: 'Regression Models',
              icon: TrendingUp,
              color: '#f093fb',
              items: ['Ridge Regression', 'Random Forest Regressor', 'Gradient Boosting Regressor', 'Ensemble Methods']
            },
            {
              title: 'Feature Engineering',
              icon: Analytics,
              color: '#4facfe',
              items: ['Density Features', 'Spatial Distribution', 'Gradient Analysis', 'Motion Patterns', 'Temporal Trends']
            }
          ].map((feature, idx) => (
            <Grid item xs={12} md={3} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card sx={{
                  background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.8) 0%, rgba(15, 20, 41, 0.8) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${feature.color}40`,
                  borderRadius: '20px',
                  p: 3,
                  height: '100%',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: `0 12px 48px ${feature.color}40`,
                    border: `1px solid ${feature.color}80`
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <feature.icon sx={{ fontSize: 28, color: feature.color }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {feature.items.map((item, itemIdx) => (
                      <Box key={itemIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: feature.color }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default WorldClassDashboard;
