'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoUpload from '@/components/VideoUpload';
import VideoPlayer from '@/components/VideoPlayer';
import { useRealtimeAnalysis } from '@/hooks/useRealtimeAnalysis';
import RealTimeCharts from '@/components/RealTimeCharts';
import AlertPanel from '@/components/AlertPanel';
import { FiActivity, FiShield, FiCpu, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

export default function Home() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState<string>('');
  
  const {
    isConnected,
    isComplete,
    currentFrame,
    riskTimeline,
    metadata,
    error,
    startAnalysis,
    stopAnalysis
  } = useRealtimeAnalysis();

  const handleUploadComplete = (id: string, meta: any) => {
    setVideoId(id);
    setVideoMetadata(meta);
    setUploadedFilename(meta.filename || id);
    setIsAnalyzing(true);
    
    // Start real-time analysis with filename for demo mode
    setTimeout(() => {
      startAnalysis(id, meta.filename || meta.original_filename || id);
    }, 800);
  };

  const getRiskColor = (risk: number) => {
    if (risk > 0.8) return '#ef4444'; // Danger
    if (risk > 0.6) return '#f59e0b'; // Warning
    if (risk > 0.3) return '#3b82f6'; // Info
    return '#10b981'; // Success
  };

  const getRiskLevel = (risk: number) => {
    if (risk > 0.8) return 'CRITICAL';
    if (risk > 0.6) return 'ELEVATED';
    if (risk > 0.3) return 'MODERATE';
    return 'STABLE';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar - Control Center */}
      <aside className="w-80 border-r border-slate-800/50 bg-slate-950/50 flex flex-col">
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <FiShield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">CrowdGuard <span className="text-purple-500">AI</span></h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Security Protocol Alpha</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Status Section */}
          <section>
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">System Status</h2>
            <div className="space-y-2">
              <div className="glass p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiActivity className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span className="text-sm text-slate-300">Analysis Engine</span>
                </div>
                {isConnected ? (
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                ) : (
                  <span className="text-[10px] text-slate-600 font-mono">STANDBY</span>
                )}
              </div>
              <div className="glass p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiCpu className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300">GPU Acceleration</span>
                </div>
                <span className="text-[10px] text-purple-400 font-mono">ACTIVE</span>
              </div>
            </div>
          </section>

          {/* Session Data */}
          <section>
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Session Pipeline</h2>
            {videoId ? (
              <div className="space-y-3">
                <div className="glass p-4 rounded-xl space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Source Video</p>
                    <p className="text-xs text-white truncate font-medium">{uploadedFilename}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase mb-1">FPS</p>
                      <p className="text-sm text-white font-mono">{metadata?.fps.toFixed(1) || videoMetadata?.fps.toFixed(1) || '0.0'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Processed</p>
                      <p className="text-sm text-white font-mono">{currentFrame?.processed_count || 0} / {metadata?.frames_to_process || metadata?.total_frames || videoMetadata?.total_frames || '0'}</p>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${currentFrame?.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass p-8 rounded-xl border-dashed border-slate-700 flex flex-col items-center justify-center text-center">
                <FiInfo className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs text-slate-500">Upload video to start monitoring</p>
              </div>
            )}
          </section>

          {/* Alert Summary Feed */}
          {currentFrame && <AlertPanel riskScore={currentFrame.risk_score} />}
        </div>

        <div className="p-4 border-t border-slate-800/50">
          <div className="bg-slate-900/50 p-3 rounded-xl flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-slate-400 font-medium">Model: CIRI-Transformer v2.1.4</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/50 bg-slate-950/20 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-slate-400">
              <span className="text-xs font-medium uppercase tracking-widest leading-none">Intelligence Engine</span>
              <div className="w-1 h-3 bg-slate-700 rounded-full" />
              <span className="text-xs font-mono lowercase">{videoId ? `session_${videoId.slice(0, 8)}` : 'waiting_for_input'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <AnimatePresence>
              {isConnected && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20"
                >
                  <FiCheckCircle className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Real-Time Processing</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Demo Latency</p>
              <p className="text-xs text-emerald-400 font-mono leading-none">&lt; 10s TARGET</p>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {!videoId ? (
            <div className="h-full flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl"
              >
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Spatiotemporal Crowd Analysis</h2>
                  <p className="text-slate-400">Upload high-density footage to initialize the intelligence pipeline. Our models will analyze motion instability in real-time.</p>
                </div>
                <VideoUpload onUploadComplete={handleUploadComplete} />
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Primary Visualizer */}
              <div className="xl:col-span-8 space-y-6">
                <VideoPlayer
                  videoId={videoId}
                  isAnalyzing={isAnalyzing}
                  currentFrame={currentFrame?.frame || 0}
                  totalFrames={metadata?.total_frames || videoMetadata?.total_frames || 0}
                  filename={uploadedFilename}
                />
                
                {/* Advanced Metrics Grid */}
                {riskTimeline.length > 0 && (
                  <RealTimeCharts riskTimeline={riskTimeline} currentFrame={currentFrame} />
                )}
              </div>

              {/* Intelligence Overlay */}
              <div className="xl:col-span-4 space-y-6">
                {/* Risk Gauge Card */}
                <div className="glass rounded-2xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                    <FiActivity className="w-12 h-12 text-purple-500" />
                  </div>
                  
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">Instability Index</h3>
                  
                  {currentFrame ? (
                    <div className="space-y-6 text-center">
                      <motion.div
                        key={currentFrame.risk_score}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative inline-block"
                      >
                        <span className="text-7xl font-black text-white tracking-tighter" style={{ color: getRiskColor(currentFrame.risk_score) }}>
                          {(currentFrame.risk_score * 100).toFixed(1)}
                          <span className="text-2xl ml-1">%</span>
                        </span>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 min-w-[120px] px-3 py-1 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                           <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: getRiskColor(currentFrame.risk_score) }}>
                            {getRiskLevel(currentFrame.risk_score)}
                           </p>
                        </div>
                      </motion.div>

                      <div className="grid grid-cols-2 gap-3 pt-6">
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">CIRI Score</p>
                          <p className="text-xl font-bold text-white font-mono">{currentFrame.ciri_score.toFixed(3)}</p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Motion Var</p>
                          <p className="text-xl font-bold text-white font-mono">{currentFrame.velocity_variance.toFixed(3)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 border-t-2 border-purple-500 rounded-full animate-spin mx-auto opacity-50" />
                      <p className="text-xs text-slate-500 font-medium">Initializing CIRI-Transformer...</p>
                    </div>
                  )}
                </div>

                {/* System Logs */}
                <div className="glass rounded-2xl p-6 flex-1 flex flex-col min-h-[300px]">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Temporal Feed</h3>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 rounded-full bg-slate-600" />
                      <div className="w-1 h-1 rounded-full bg-slate-600" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {riskTimeline.slice(-10).reverse().map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 text-[10px] border border-white/5 hover:bg-slate-900/60 transition-colors">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500">#{entry.frame}</span>
                          <span className="text-slate-300 font-medium">INDEX_{entry.risk_score.toFixed(3)}</span>
                        </div>
                        <span className="font-mono text-purple-400">{(entry.progress).toFixed(1)}%</span>
                      </div>
                    ))}
                    {riskTimeline.length === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest text-center">Stream Data Inactive</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Error Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-4 rounded-2xl border-emerald-500/50 flex items-center space-x-4 shadow-2xl z-50"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="pr-4 border-r border-slate-700">
                <p className="text-xs font-bold text-white uppercase tracking-tight">Intelligence Failure</p>
                <p className="text-xs text-slate-400">{error}</p>
              </div>
              <button onClick={() => window.location.reload()} className="text-xs font-bold text-slate-300 hover:text-white uppercase transition-colors">Retry</button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
