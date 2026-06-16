// e:/AI Talent OS/src/pages/Logs/Logs.tsx
import React from 'react';
import { useStore } from '../../store/useStore';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { Terminal, Trash2, Cpu, ShieldCheck, HardDrive } from 'lucide-react';

export const Logs: React.FC = () => {
  const { activityLogs, addActivityLog } = useStore();

  const handleClearLogs = () => {
    // Clear log action is logged
    addActivityLog("Logs database cleared by administrator.");
  };

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo bottom-10 right-10 animate-pulse-slow"></div>
      <div className="glow-orb-cyan top-10 left-10 animate-pulse-slow"></div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">System Console</h1>
          <p className="text-brand-silver text-sm mt-0.5 font-medium">Internal operational logs and memory buffer metrics.</p>
        </div>

        {/* Console Environment statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-brand-cyan shrink-0" />
            <div>
              <div className="text-[10px] text-brand-silver uppercase">Processing engine</div>
              <div className="text-xs font-bold text-white mt-0.5">Vite v6.0 / React v19.0</div>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-3">
            <HardDrive className="h-5 w-5 text-brand-indigo shrink-0" />
            <div>
              <div className="text-[10px] text-brand-silver uppercase">Memory storage</div>
              <div className="text-xs font-bold text-white mt-0.5">LocalStorage Persistent</div>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-brand-success shrink-0" />
            <div>
              <div className="text-[10px] text-brand-silver uppercase">Security policy</div>
              <div className="text-xs font-bold text-white mt-0.5">HTTPS / TLS Configured</div>
            </div>
          </GlassCard>
        </div>

        {/* Live console logger */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-brand-cyan" />
              <h2 className="text-sm font-bold font-display text-white">Active Activity Buffer</h2>
            </div>
            
            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded bg-white/5 border border-white/10 hover:bg-brand-error/10 hover:text-brand-error transition text-brand-silver text-[10px] font-bold flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Clear Buffer
            </button>
          </div>

          <div className="bg-black/90 border border-white/5 p-4 rounded-xl font-mono text-[11px] text-brand-cyan space-y-2 max-h-96 overflow-y-auto leading-relaxed shadow-inner">
            {activityLogs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-brand-indigo shrink-0">&gt;_</span>
                <span className="text-brand-silver">{log}</span>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
