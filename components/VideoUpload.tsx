'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';

interface VideoUploadProps {
  onUploadComplete: (videoId: string, metadata: any) => void;
}

export default function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadProgress(100);
          setTimeout(() => {
            onUploadComplete(response.video_id, response);
          }, 500);
        } else {
          setError('Upload failed. Please try again.');
          setIsUploading(false);
        }
      });

      xhr.addEventListener('error', () => {
        setError('Network error. Please check your connection.');
        setIsUploading(false);
      });

      xhr.open('POST', 'http://localhost:8000/api/v1/upload-video/');
      xhr.send(formData);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    multiple: false,
    disabled: isUploading
  });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!isUploading ? (
          <div
            key="upload-idle"
            {...getRootProps()}
            className={`
              relative overflow-hidden group cursor-pointer
              aspect-[21/9] rounded-3xl border-2 border-dashed
              transition-all duration-500 ease-out
              flex flex-col items-center justify-center p-8
              ${isDragActive 
                ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_40px_rgba(139,92,246,0.1)]' 
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
              }
            `}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full"
            >
              <input {...getInputProps()} />
              
              {/* Background scanner effect on hover */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-purple-500/10 to-transparent translate-y-[-100%] group-hover:translate-y-[200%] transition-transform duration-[2s] ease-in-out pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center mb-6
                  transition-transform duration-500 group-hover:scale-110
                  ${isDragActive ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}
                `}>
                  <FiUploadCloud className="w-10 h-10" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                  {isDragActive ? 'Release to Initialize' : 'Initialize Vision Stream'}
                </h3>
                <p className="text-slate-500 text-sm font-medium">
                  Drag & drop crowd footage or <span className="text-purple-400 font-bold italic">browse system</span>
                </p>
                
                <div className="mt-8 flex items-center space-x-6">
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    <FiFile className="w-3 h-3" />
                    <span>MP4 / MOV / AVI</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-800" />
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    <FiCheck className="w-3 h-3" />
                    <span>CIRI COMPLIANT</span>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center space-x-2 text-red-500 text-xs font-bold"
                >
                  <FiAlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        ) : (
          <div
            key="upload-active"
            className="aspect-[21/9] rounded-3xl border border-slate-800 bg-slate-900/40 p-8 flex flex-col items-center justify-center relative overflow-hidden"
          >
             {/* Scanning Line */}
            <motion.div 
              className="absolute left-0 right-0 h-px bg-purple-500 shadow-[0_0_15px_#8b5cf6] z-10"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-20 flex flex-col items-center text-center">
              <div className="relative mb-8 group">
                <FiLoader className="w-16 h-16 text-purple-500 animate-spin" />
                <motion.div 
                  className="absolute inset-x-0 -bottom-4 h-1.5 w-1.2 bg-purple-500/20 blur-md rounded-full mx-auto"
                  animate={{ scaleX: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white font-mono">
                  {uploadProgress}%
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">
                {uploadProgress < 20 ? 'Connecting to Neural Grid' : 
                 uploadProgress < 50 ? 'Encrypting & Uploading' : 
                 uploadProgress < 85 ? 'Optimizing Spatiotemporal Kernels' : 
                 'Finalizing Secure Stream'}
              </h3>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium">
                {uploadProgress < 15 ? 'Synchronizing with AWS_US_EAST_1A clusters...' : 
                 uploadProgress < 40 ? 'Streaming crowd kernels for high-fidelity analysis.' : 
                 uploadProgress < 80 ? 'Calibrating Spatio-Temporal Transformers.' : 
                 'Establishing low-latency websocket link...'}
              </p>

              <div className="mt-10 w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
