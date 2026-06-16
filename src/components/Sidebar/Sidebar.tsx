// e:/AI Talent OS/src/components/Sidebar/Sidebar.tsx
import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Video, 
  Sparkles, 
  MessageSquare, 
  GraduationCap, 
  Users, 
  BarChart3, 
  Terminal,
  Activity
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeRole, activePage, setActivePage } = useStore();

  const handlePageClick = (pageId: string) => {
    setActivePage(pageId);
  };

  const getLinks = () => {
    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];

    if (activeRole === 'candidate') {
      return [
        ...common,
        { id: 'analyzer', label: 'Resume Analyzer', icon: FileText },
        { id: 'matcher', label: 'AI Job Matcher', icon: Briefcase },
        { id: 'interview', label: 'Interview Assistant', icon: Video },
        { id: 'gap', label: 'Skill Gap Detector', icon: Sparkles },
        { id: 'coach', label: 'AI Career Coach', icon: MessageSquare },
        { id: 'learning', label: 'Learning Center', icon: GraduationCap }
      ];
    } else if (activeRole === 'recruiter') {
      return [
        ...common,
        { id: 'recruiter', label: 'Recruiter Portal', icon: Users },
        { id: 'analytics', label: 'Hiring Analytics', icon: BarChart3 }
      ];
    } else { // admin
      return [
        ...common,
        { id: 'recruiter', label: 'Recruiter Portal', icon: Users },
        { id: 'analytics', label: 'Hiring Analytics', icon: BarChart3 },
        { id: 'logs', label: 'System Console', icon: Terminal }
      ];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 border-r border-brand-border bg-brand-dark/40 flex flex-col justify-between shrink-0">
      <div className="flex-1 py-6">
        {/* Profile Card Summary */}
        <div className="px-6 mb-6">
          <div className="glass-panel p-4 bg-brand-indigo/5 border border-brand-indigo/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center font-display font-extrabold text-sm text-white">
              {activeRole === 'candidate' ? 'CD' : activeRole === 'recruiter' ? 'RC' : 'AD'}
            </div>
            <div>
              <div className="text-xs text-brand-silver font-semibold uppercase tracking-wider">Active Workspace</div>
              <div className="text-sm font-bold text-white capitalize">{activeRole} Suite</div>
            </div>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="space-y-1 px-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handlePageClick(link.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-brand-indigo/20 border border-brand-indigo/40 text-white shadow-[0_0_15px_-3px_rgba(63,78,255,0.4)]' 
                    : 'text-brand-silver hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-brand-cyan' : ''}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer info */}
      <div className="p-4 border-t border-brand-border text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] text-brand-silver font-mono">
          <Activity className="h-3 w-3 text-brand-cyan animate-pulse" />
          <span>Antigravity Engine v1.0.4</span>
        </div>
      </div>
    </aside>
  );
};
