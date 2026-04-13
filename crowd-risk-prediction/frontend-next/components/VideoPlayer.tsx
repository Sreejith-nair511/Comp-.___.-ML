'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiSettings, FiMaximize, FiActivity } from 'react-icons/fi';

interface VideoPlayerProps {
  videoId: string;
  isAnalyzing: boolean;
  currentFrame: number;
  totalFrames: number;
  filename?: string;
}

export default function VideoPlayer({ videoId, isAnalyzing, currentFrame, totalFrames, filename }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showOverlay, setShowOverlay] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Construct video URL
  const videoUrl = filename 
    ? `http://localhost:8000/uploads/${filename}`
    : `http://localhost:8000/api/v1/video/${videoId}/stream`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
      } else {
        await video.play();
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error('Playback error:', err);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Primary Video Canvas */}
      <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-white/5 shadow-2xl group">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setVideoError("Stream Link Unstable | Retrying Initialization...")}
          onLoadedData={() => {
            setVideoLoaded(true);
            setVideoError(null);
          }}
          preload="auto"
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
          Your system does not support H.264 encrypted streams.
        </video>
        
        {/* Intelligence Overlay */}
        <AnimatePresence>
          {isAnalyzing && showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Corner Indicators */}
              <div className="absolute top-6 left-6 flex items-center space-x-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Analysis Feed</span>
              </div>
              
              <div className="absolute bottom-6 right-6 text-right">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Processing Node</p>
                <p className="text-xs font-mono text-purple-400">AWS_US_EAST_1A</p>
              </div>

              {/* Scanning Line Effect */}
              <motion.div 
                className="absolute left-0 right-0 h-[2px] bg-purple-500/30 shadow-[0_0_20px_#8b5cf6] z-10"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {!videoLoaded && !videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xl z-20">
            <FiActivity className="w-12 h-12 text-purple-500 animate-pulse mb-4" />
            <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Calibrating Sensors...</p>
          </div>
        )}

        {videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-xl z-20 p-8 text-center">
            <FiSettings className="w-12 h-12 text-red-500 animate-spin-slow mb-4" />
            <p className="text-xs font-black text-white uppercase tracking-widest mb-2">{videoError}</p>
            <p className="text-[10px] text-red-300/60 max-w-xs">{videoUrl}</p>
          </div>
        )}
      </div>

      {/* Control Module */}
      <div className="glass rounded-2xl p-4 flex items-center space-x-6">
        <div className="flex items-center space-x-4">
           <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-xl bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6 ml-1" />}
          </button>
          
          <div className="h-8 w-[1px] bg-slate-800" />
          
          <div className="flex items-center space-x-1">
             <button onClick={() => videoRef.current && (videoRef.current.currentTime -= 5)} className="p-2 text-slate-400 hover:text-white transition-colors">
              <FiSkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => videoRef.current && (videoRef.current.currentTime += 5)} className="p-2 text-slate-400 hover:text-white transition-colors">
              <FiSkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress System */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500">{formatTime(currentTime)}</span>
            <span className="text-[10px] font-mono text-slate-500">{formatTime(duration)}</span>
          </div>
          <div className="relative group/progress h-1.5 flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step="0.01"
              value={currentTime}
              onChange={(e) => videoRef.current && (videoRef.current.currentTime = parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white relative"
                initial={false}
                animate={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] opacity-0 group-hover/progress:opacity-100 transition-opacity" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-900/80 rounded-lg p-1 border border-white/5">
            {[0.5, 1, 2].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-3 py-1 rounded text-[10px] font-black transition-all ${
                  playbackRate === rate ? 'bg-white text-slate-950' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <FiMaximize className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowOverlay(!showOverlay)}
            className={`p-2 transition-colors ${showOverlay ? 'text-purple-400' : 'text-slate-600'}`}
          >
            <FiSettings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
