// e:/AI Talent OS/src/components/Navbar/Navbar.tsx
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { UserRole } from '../../store/useStore';
import { Settings, Shield, User, Bell, Check } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeRole, 
    setActiveRole, 
    apiSettings, 
    updateApiSettings, 
    userProfile,
    activityLogs 
  } = useStore();
  
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [keyInput, setKeyInput] = useState(apiSettings.geminiKey);
  const [isSim, setIsSim] = useState(apiSettings.isSimulator);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiSettings({
      geminiKey: keyInput,
      isSimulator: isSim
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSettings(false);
    }, 1200);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveRole(e.target.value as UserRole);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-black/60 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-brand-indigo/10 border border-brand-indigo/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-indigo to-brand-cyan opacity-40 animate-pulse-slow"></div>
            <span className="font-display font-black text-lg text-white tracking-wider z-10">Ω</span>
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-white">
            AI TALENT <span className="text-brand-cyan">OS</span>
          </span>
        </div>

        {/* Right Navigation Elements */}
        <div className="flex items-center gap-4">
          


          {/* Role Switcher */}
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-silver" />
            <select
              value={activeRole}
              onChange={handleRoleChange}
              className="bg-brand-dark border border-brand-border text-white text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-brand-cyan transition"
            >
              <option value="candidate">Candidate View</option>
              <option value="recruiter">Recruiter View</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-brand-silver hover:text-white transition relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-cyan"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass-panel p-4 z-50 text-xs">
                <h4 className="font-semibold text-white mb-3 text-sm border-b border-brand-border pb-2 flex justify-between items-center">
                  <span>Recent Events</span>
                  <span className="text-[10px] text-brand-cyan">Live Sync</span>
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {activityLogs.slice(0, 5).map((log, i) => (
                    <div key={i} className="text-brand-silver border-l-2 border-brand-indigo pl-2 py-0.5">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings / API Panel */}
          <button 
            onClick={() => {
              setShowSettings(!showSettings);
              setShowNotifications(false);
            }}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-brand-silver hover:text-white transition"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Profile Quick-view */}
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <div className="h-8 w-8 rounded-full bg-brand-indigo/20 border border-brand-indigo/40 flex items-center justify-center">
              <User className="h-4 w-4 text-brand-cyan" />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white">{userProfile.name}</div>
              <div className="text-[10px] text-brand-silver font-medium">{userProfile.title}</div>
            </div>
          </div>

        </div>
      </div>

      {/* API Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 border border-brand-border">
            <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-4">
              <h3 className="font-display font-extrabold text-lg text-white">AI Services Configuration</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-brand-silver hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-silver mb-1.5">
                  AI Operations Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSim(true)}
                    className={`p-3 rounded-lg border text-xs font-bold transition ${
                      isSim 
                        ? 'border-brand-indigo bg-brand-indigo/10 text-white' 
                        : 'border-white/10 bg-white/5 text-brand-silver hover:border-white/20'
                    }`}
                  >
                    AI Simulator (No Key)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSim(false)}
                    className={`p-3 rounded-lg border text-xs font-bold transition ${
                      !isSim 
                        ? 'border-brand-cyan bg-brand-cyan/10 text-white' 
                        : 'border-white/10 bg-white/5 text-brand-silver hover:border-white/20'
                    }`}
                  >
                    Google Gemini API
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-brand-silver">
                  {isSim 
                    ? "Offline mode. High-fidelity dynamic prompts simulate Gemini responses instantly without costs." 
                    : "Requests are sent directly to the official Google Gemini API (gemini-1.5-flash) using your browser."}
                </p>
              </div>

              {!isSim && (
                <div>
                  <label className="block text-xs font-semibold text-brand-silver mb-1.5">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan"
                  />
                  <p className="mt-1 text-[10px] text-brand-silver">
                    Your key is stored securely in your browser's local state and is never shared.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-brand-silver hover:text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-indigo text-white hover:bg-brand-indigo/80 text-xs font-bold transition flex items-center gap-1.5"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-brand-cyan" />
                      Applied!
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
