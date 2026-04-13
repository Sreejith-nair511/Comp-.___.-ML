import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Container,
  Chip,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  CheckCircle,
  Speed,
  Memory,
  Storage,
  Science,
  AutoGraph,
  ModelTraining,
  Assessment,
  DonutLarge
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  Line,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

// Data generators
const generateClusterData = () => {
  const clusters = [];
  for (let i = 0; i < 150; i++) {
    const cluster = Math.floor(Math.random() * 5);
    clusters.push({
      x: cluster * 18 + Math.random() * 12 + 10,
      y: cluster * 14 + Math.random() * 16 + 10,
      z: Math.random() * 100,
      cluster: `Cluster ${cluster + 1}`,
      risk: Math.random()
    });
  }
  return clusters;
};

const generatePCAData = () =>
  Array.from({ length: 20 }, (_, i) => ({
    component: `PC${i + 1}`,
    variance: Math.exp(-i * 0.2) * 100,
    cumulative: (1 - Math.exp(-i * 0.2)) * 100
  }));

const generateFeatureImportance = () => [
  { feature: 'Mean Density', importance: 92 },
  { feature: 'Motion Magnitude', importance: 87 },
  { feature: 'Directional Entropy', importance: 82 },
  { feature: 'Flow Opposition', importance: 78 },
  { feature: 'Density Gradient', importance: 75 },
  { feature: 'Motion Compression', importance: 71 },
  { feature: 'Acceleration Spikes', importance: 68 },
  { feature: 'Temporal Trend', importance: 64 },
  { feature: 'Spatial Variance', importance: 59 },
  { feature: 'Crowd Velocity', importance: 55 }
];

const generateModelComparison = () => [
  { metric: 'Accuracy', 'Random Forest': 94, 'Gradient Boost': 96, 'SVM': 89, 'Neural Net': 92 },
  { metric: 'Precision', 'Random Forest': 93, 'Gradient Boost': 95, 'SVM': 88, 'Neural Net': 91 },
  { metric: 'Recall', 'Random Forest': 92, 'Gradient Boost': 94, 'SVM': 87, 'Neural Net': 90 },
  { metric: 'F1-Score', 'Random Forest': 93, 'Gradient Boost': 95, 'SVM': 88, 'Neural Net': 91 },
  { metric: 'AUC-ROC', 'Random Forest': 96, 'Gradient Boost': 98, 'SVM': 91, 'Neural Net': 94 }
];

const generateRadarData = () => [
  { metric: 'Accuracy', value: 94, fullMark: 100 },
  { metric: 'Speed', value: 87, fullMark: 100 },
  { metric: 'Scalability', value: 92, fullMark: 100 },
  { metric: 'Robustness', value: 89, fullMark: 100 },
  { metric: 'Interpretability', value: 78, fullMark: 100 },
  { metric: 'Generalization', value: 91, fullMark: 100 }
];

const generateConfusionMatrix = () => {
  const labels = ['Very Low', 'Low', 'Medium', 'High', 'V. High'];
  const matrix = [];
  labels.forEach((actual, i) => {
    labels.forEach((predicted, j) => {
      matrix.push({ actual, predicted, value: i === j ? 85 + Math.random() * 10 : Math.random() * 8 });
    });
  });
  return { matrix, labels };
};

const CardStyle = {
  background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.9) 0%, rgba(15, 20, 41, 0.9) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(102, 126, 234, 0.3)',
  borderRadius: '16px',
  p: 2,
  height: '100%'
};

const UltraDenseDashboard = () => {
  const [currentRisk, setCurrentRisk] = useState(0.23);
  const [systemMetrics, setSystemMetrics] = useState({ fps: 28.5, memory: 62, gpu: 45, cpu: 38 });
  const [riskTimeline, setRiskTimeline] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      time: i,
      risk: 0.2 + Math.random() * 0.3,
      density: 0.3 + Math.random() * 0.4
    }))
  );

  const [clusterData] = useState(generateClusterData());
  const [pcaData] = useState(generatePCAData());
  const [featureImportance] = useState(generateFeatureImportance());
  const [modelComparison] = useState(generateModelComparison());
  const [radarData] = useState(generateRadarData());
  const [confusionData] = useState(generateConfusionMatrix());

  const [crowdComposition] = useState([
    { name: 'Very Low', value: 15 },
    { name: 'Low', value: 35 },
    { name: 'Medium', value: 30 },
    { name: 'High', value: 15 },
    { name: 'V. High', value: 5 }
  ]);

  const [trainingHistory] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      epoch: i + 1,
      trainAcc: 0.7 + (i / 50) * 0.28 + Math.random() * 0.02,
      valAcc: 0.68 + (i / 50) * 0.27 + Math.random() * 0.02,
      loss: Math.exp(-i * 0.08) * 0.5 + Math.random() * 0.02
    }))
  );

  useEffect(() => {
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

  const getRiskColor = (risk) => risk > 0.8 ? '#ff4757' : risk > 0.6 ? '#ffa502' : risk > 0.3 ? '#667eea' : '#00ff88';
  const getRiskLevel = (risk) => risk > 0.8 ? 'CRITICAL' : risk > 0.6 ? 'HIGH' : risk > 0.3 ? 'MODERATE' : 'LOW';

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1429 100%)', position: 'relative' }}>
      {/* Header - Compact */}
      <Box sx={{ background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.95) 0%, rgba(15, 20, 41, 0.95) 100%)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(102, 126, 234, 0.3)', px: 3, py: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)' }}>
              <Psychology sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CrowdGuard AI - Ultra Analytics Dashboard</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Advanced ML-Powered Crowd Analysis • 15+ Algorithms • Real-Time Processing</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#00ff88', boxShadow: '0 0 10px #00ff88', animation: 'pulse 2s infinite' }} />
              <Typography sx={{ color: '#00ff88', fontWeight: 700, fontSize: '0.85rem' }}>LIVE</Typography>
            </Box>
            {[
              { icon: Speed, label: 'FPS', value: systemMetrics.fps.toFixed(1), color: '#667eea' },
              { icon: Memory, label: 'RAM', value: `${systemMetrics.memory.toFixed(0)}%`, color: '#764ba2' },
              { icon: Storage, label: 'GPU', value: `${systemMetrics.gpu.toFixed(0)}%`, color: '#f093fb' }
            ].map((metric, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.8, borderRadius: '10px', bgcolor: `${metric.color}15`, border: `1px solid ${metric.color}40` }}>
                <metric.icon sx={{ fontSize: 18, color: metric.color }} />
                <Box>
                  <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>{metric.value}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>{metric.label}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: 2, position: 'relative', zIndex: 1 }}>
        {/* Status Bar - Ultra Compact */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[
            { icon: CheckCircle, label: 'AI Models Active', color: '#00ff88' },
            { icon: Science, label: '15+ ML Algorithms', color: '#667eea' },
            { icon: ModelTraining, label: 'Training: Epoch 47', color: '#764ba2' },
            { icon: AutoGraph, label: 'PCA: 95% Variance', color: '#f093fb' },
            { icon: Assessment, label: 'Accuracy: 96.2%', color: '#4facfe' }
          ].map((status, idx) => (
            <Chip key={idx} icon={<status.icon sx={{ color: status.color, fontSize: 18 }} />} label={status.label} sx={{ px: 2, py: 2.5, borderRadius: '12px', bgcolor: `${status.color}15`, border: `1px solid ${status.color}40`, '& .MuiChip-label': { color: status.color, fontWeight: 700, fontSize: '0.8rem' } }} />
          ))}
        </Box>

        {/* ROW 1: Main Risk Gauge + Timeline + Composition */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={2.4}>
            <Card sx={{ ...CardStyle, textAlign: 'center', border: `2px solid ${getRiskColor(currentRisk)}60`, boxShadow: `0 8px 32px ${getRiskColor(currentRisk)}30` }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Current Risk</Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, color: getRiskColor(currentRisk), fontSize: '3.5rem', textShadow: `0 0 30px ${getRiskColor(currentRisk)}80`, my: 1 }}>{(currentRisk * 100).toFixed(1)}%</Typography>
              <Chip label={getRiskLevel(currentRisk)} sx={{ px: 3, py: 2.5, borderRadius: '10px', bgcolor: getRiskColor(currentRisk), color: 'white', fontWeight: 800 }} />
            </Card>
          </Grid>

          <Grid item xs={12} md={5.6}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>📊 Real-Time Risk & Density Timeline</Typography>
              <ResponsiveContainer width="100%" height={180}>
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
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 11}} />
                  <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 1]} tick={{fontSize: 11}} />
                  <Tooltip contentStyle={{ background: 'rgba(26, 31, 58, 0.95)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '10px' }} />
                  <Area type="monotone" dataKey="risk" stroke="#667eea" fillOpacity={1} fill="url(#colorRisk)" />
                  <Area type="monotone" dataKey="density" stroke="#764ba2" fillOpacity={1} fill="url(#colorDensity)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>👥 Crowd Density Distribution</Typography>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={crowdComposition} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={70} fill="#8884d8" dataKey="value">
                    {crowdComposition.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* ROW 2: Cluster Scatter + PCA + Feature Importance */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>🔵 K-Means Cluster Visualization (5 Clusters)</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="x" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 10}} />
                  <YAxis dataKey="y" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 10}} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(26, 31, 58, 0.95)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '10px' }} />
                  {[0, 1, 2, 3, 4].map(cluster => (
                    <Scatter key={cluster} name={`Cluster ${cluster + 1}`} data={clusterData.filter(d => d.cluster === `Cluster ${cluster + 1}`)} fill={COLORS[cluster]} />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>📉 PCA Variance Explained (20 Components)</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={pcaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="component" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 10}} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{ background: 'rgba(26, 31, 58, 0.95)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '10px' }} />
                  <Legend />
                  <Bar dataKey="variance" fill="#667eea" name="Individual Variance %" />
                  <Line type="monotone" dataKey="cumulative" stroke="#f093fb" strokeWidth={2} name="Cumulative %" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>🎯 Feature Importance Ranking (Top 10)</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={featureImportance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" domain={[0, 100]} tick={{fontSize: 10}} />
                  <YAxis dataKey="feature" type="category" stroke="rgba(255,255,255,0.5)" width={110} tick={{fontSize: 9}} />
                  <Tooltip contentStyle={{ background: 'rgba(26, 31, 58, 0.95)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '10px' }} />
                  <Bar dataKey="importance" fill="#667eea" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* ROW 3: Model Comparison + Radar + Training History */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={5}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>🤖 ML Model Performance Comparison</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={modelComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 10}} />
                  <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{ background: 'rgba(26, 31, 58, 0.95)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '10px' }} />
                  <Legend />
                  <Bar dataKey="Random Forest" fill="#667eea" />
                  <Bar dataKey="Gradient Boost" fill="#764ba2" />
                  <Bar dataKey="SVM" fill="#f093fb" />
                  <Bar dataKey="Neural Net" fill="#4facfe" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={3.5}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>🎯 System Performance Radar</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fontSize: 9}} />
                  <Radar name="Performance" dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={3.5}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>📈 Model Training Progress (50 Epochs)</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={trainingHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="epoch" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 10}} />
                  <YAxis stroke="rgba(255,255,255,0.5)" domain={[0.5, 1]} tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{ background: 'rgba(26, 31, 58, 0.95)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '10px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="trainAcc" stroke="#00ff88" strokeWidth={2} dot={false} name="Train Acc" />
                  <Line type="monotone" dataKey="valAcc" stroke="#667eea" strokeWidth={2} dot={false} name="Val Acc" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* ROW 4: Confusion Matrix Table + Risk Distribution + Model Metrics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={5}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>🎯 Confusion Matrix (Classification Results)</Typography>
              <TableContainer sx={{ maxHeight: 200 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem', bgcolor: 'rgba(102, 126, 234, 0.3)' }}>Actual \\ Predicted</TableCell>
                      {confusionData.labels.map(label => (<TableCell key={label} align="center" sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem', bgcolor: 'rgba(102, 126, 234, 0.3)' }}>{label}</TableCell>))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {confusionData.labels.map((actual, i) => (
                      <TableRow key={actual} sx={{ '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' } }}>
                        <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>{actual}</TableCell>
                        {confusionData.labels.map((predicted, j) => {
                          const value = confusionData.matrix.find(m => m.actual === actual && m.predicted === predicted)?.value || 0;
                          return (<TableCell key={predicted} align="center" sx={{ color: i === j ? '#00ff88' : 'rgba(255,255,255,0.7)', fontWeight: i === j ? 700 : 400, fontSize: '0.75rem', bgcolor: i === j ? 'rgba(0, 255, 136, 0.1)' : 'transparent' }}>{value.toFixed(1)}%</TableCell>);
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={3.5}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>📊 Risk Score Distribution</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Array.from({length: 20}, (_, i) => ({ risk: `${i*5}-${(i+1)*5}`, count: Math.floor(Math.exp(-Math.pow(i - 10, 2) / 50) * 80) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="risk" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 9}} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{fontSize: 9}} />
                  <Tooltip contentStyle={{ background: 'rgba(26, 31, 58, 0.95)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '10px' }} />
                  <Bar dataKey="count" fill="#667eea" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={3.5}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>⚡ Real-Time ML Metrics</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { label: 'Training Accuracy', value: 96.2, color: '#00ff88' },
                  { label: 'Validation Accuracy', value: 95.4, color: '#667eea' },
                  { label: 'F1-Score (Ensemble)', value: 95.1, color: '#764ba2' },
                  { label: 'AUC-ROC', value: 97.8, color: '#f093fb' },
                  { label: 'Inference Time', value: 87, color: '#4facfe' },
                  { label: 'Model Confidence', value: 93.5, color: '#43e97b' }
                ].map((metric, idx) => (
                  <Box key={idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{metric.label}</Typography>
                      <Typography sx={{ color: metric.color, fontWeight: 700, fontSize: '0.75rem' }}>{metric.value}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={metric.value} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: metric.color, borderRadius: 3 } }} />
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* ROW 5: Active Models Status + Algorithm Details */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>🧠 Active ML Models Status</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {[
                  { name: 'Random Forest', type: 'Classifier', accuracy: 94, color: '#667eea' },
                  { name: 'Gradient Boost', type: 'Classifier', accuracy: 96, color: '#764ba2' },
                  { name: 'SVM', type: 'Classifier', accuracy: 89, color: '#f093fb' },
                  { name: 'Neural Net', type: 'Classifier', accuracy: 92, color: '#4facfe' },
                  { name: 'Logistic Reg', type: 'Classifier', accuracy: 85, color: '#43e97b' },
                  { name: 'K-Means', type: 'Clustering', accuracy: 91, color: '#fa709a' },
                  { name: 'Isolation Forest', type: 'Anomaly', accuracy: 88, color: '#fee140' },
                  { name: 'DBSCAN', type: 'Clustering', accuracy: 87, color: '#30cfd0' },
                  { name: 'PCA', type: 'Reduction', accuracy: 95, color: '#667eea' }
                ].map((model, idx) => (
                  <Box key={idx} sx={{ p: 1.5, borderRadius: '10px', bgcolor: `${model.color}15`, border: `1px solid ${model.color}40` }}>
                    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>{model.name}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>{model.type}</Typography>
                    <Typography sx={{ color: model.color, fontWeight: 800, fontSize: '1.1rem' }}>{model.accuracy}%</Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={CardStyle}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>📋 Complete Algorithm Pipeline</Typography>
              <Grid container spacing={1}>
                {[
                  { category: 'Supervised', items: ['Random Forest (30%)', 'Gradient Boost (35%)', 'SVM (15%)', 'Neural Net (10%)', 'Logistic Reg (10%)'], color: '#667eea' },
                  { category: 'Unsupervised', items: ['K-Means Clustering', 'DBSCAN', 'Isolation Forest', 'Anomaly Detection'], color: '#764ba2' },
                  { category: 'Regression', items: ['Ridge Regression', 'RF Regressor', 'GB Regressor', 'Ensemble Methods'], color: '#f093fb' },
                  { category: 'Features', items: ['Density (5)', 'Spatial (8)', 'Gradient (4)', 'Motion (6)', 'Temporal (4)'], color: '#4facfe' }
                ].map((section, idx) => (
                  <Grid item xs={6} key={idx}>
                    <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: `${section.color}10`, border: `1px solid ${section.color}30`, height: '100%' }}>
                      <Typography sx={{ color: section.color, fontWeight: 700, fontSize: '0.8rem', mb: 0.5 }}>{section.category}</Typography>
                      {section.items.map((item, i) => (
                        <Typography key={i} sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', mb: 0.3 }}>• {item}</Typography>
                      ))}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UltraDenseDashboard;
