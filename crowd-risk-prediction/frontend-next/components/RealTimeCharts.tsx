'use client';

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
  LineChart,
  Line,
} from 'recharts';
import { motion } from 'framer-motion';

interface FrameAnalysis {
  frame: number;
  risk_score: number;
  ciri_score: number;
  density_mean: number;
  velocity_variance: number;
  clustering_score: number;
  avg_risk: number;
  max_risk: number;
  progress: number;
  timestamp: string;
}

interface RealTimeChartsProps {
  riskTimeline: FrameAnalysis[];
  currentFrame: FrameAnalysis | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Frame #{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[11px] text-slate-300 font-medium">{entry.name}</span>
              </div>
              <span className="text-[11px] text-white font-black font-mono">
                {typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function RealTimeCharts({ riskTimeline, currentFrame }: RealTimeChartsProps) {
  if (riskTimeline.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Primary Analytics Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tighter flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>Spatio-Temporal Risk Mapping</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Real-time composite stability analysis</p>
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1 rounded-lg border border-white/5">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Risk Score</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1 rounded-lg border border-white/5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Density</span>
            </div>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskTimeline.slice(-60)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="glowRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="glowDensity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="frame" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 600, fontFamily: 'monospace' }} 
              />
              <YAxis 
                domain={[0, 1]} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 600, fontFamily: 'monospace' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="risk_score"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#glowRisk)"
                name="Risk Index"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="density_mean"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#glowDensity)"
                name="Crowd Density"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Supporting Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CIRI Component */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5"
        >
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">CIRI Metric Stream</h4>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTimeline.slice(-30)}>
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="stepAfter"
                  dataKey="ciri_score"
                  stroke="#d946ef"
                  strokeWidth={2}
                  dot={false}
                  name="CIRI Score"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Motion Instability */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5"
        >
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Velocity Dispersion</h4>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskTimeline.slice(-30)}>
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="velocity_variance" 
                  fill="#06b6d4" 
                  radius={[2, 2, 0, 0]} 
                  name="Motion Variance"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Flow Divergence */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Spatial Entropy</h4>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTimeline.slice(-30)}>
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="basis"
                  dataKey="clustering_score"
                  stroke="#10b981"
                  fill="#10b98120"
                  strokeWidth={2}
                  name="Clustering"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
