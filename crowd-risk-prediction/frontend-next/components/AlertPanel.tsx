'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiActivity, FiTerminal } from 'react-icons/fi';

interface Alert {
  id: string;
  type: string;
  score: number;
  timestamp: Date;
  message: string;
}

interface AlertPanelProps {
  riskScore: number;
}

export default function AlertPanel({ riskScore }: AlertPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (riskScore > 0.7) {
      const newAlert: Alert = {
        id: Date.now().toString(),
        type: riskScore > 0.9 ? 'CRITICAL' : 'ELEVATED_RISK',
        score: riskScore,
        timestamp: new Date(),
        message: riskScore > 0.9
          ? 'Anomalous density detected. Initializing emergency protocol.'
          : 'Instability threshold exceeded. Monitoring variance.',
      };

      setAlerts(prev => [newAlert, ...prev].slice(0, 8));
    }
  }, [riskScore]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2">
          <FiTerminal className="w-3 h-3" />
          <span>Security Protocol Logs</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-2 py-0.5 rounded border border-white/5 uppercase">
          Feed: {alerts.length > 0 ? 'Active' : 'Standby'}
        </span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        <AnimatePresence initial={false}>
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass p-6 rounded-xl border-dashed border-slate-800 flex flex-col items-center justify-center text-center opacity-40"
            >
              <FiActivity className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Normal Operations</p>
            </motion.div>
          ) : (
            alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                className={`
                  relative overflow-hidden glass rounded-xl p-3 border-l-4 
                  ${alert.type === 'CRITICAL' ? 'border-l-red-500' : 'border-l-amber-500'}
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        alert.type === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {alert.type}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-black font-mono ${
                      alert.type === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {(alert.score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
