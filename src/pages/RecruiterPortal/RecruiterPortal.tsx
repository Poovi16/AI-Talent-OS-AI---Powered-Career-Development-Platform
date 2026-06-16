// e:/AI Talent OS/src/pages/RecruiterPortal/RecruiterPortal.tsx
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Candidate } from '../../store/useStore';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { Search, ArrowRight, Star } from 'lucide-react';

export const RecruiterPortal: React.FC = () => {
  const { candidates, updateCandidateStage } = useStore();
  const [activeTab, setActiveTab] = useState<'kanban' | 'directory' | 'ranking'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Columns for Kanban Board
  const columns: { id: Candidate['stage']; label: string; color: string }[] = [
    { id: 'applied', label: 'Applied', color: 'border-brand-indigo/30' },
    { id: 'screening', label: 'Screening', color: 'border-blue-500/30' },
    { id: 'shortlisted', label: 'Shortlisted', color: 'border-brand-cyan/30' },
    { id: 'interview', label: 'Interview', color: 'border-pink-500/30' },
    { id: 'selected', label: 'Selected', color: 'border-brand-success/30' },
    { id: 'rejected', label: 'Rejected', color: 'border-brand-error/30' }
  ];

  // Advancing stages by clicking triggers (ensures excellent mobile support)
  const advanceStage = (id: string, currentStage: Candidate['stage']) => {
    const stageFlow: Candidate['stage'][] = ['applied', 'screening', 'shortlisted', 'interview', 'selected'];
    const currentIdx = stageFlow.indexOf(currentStage);
    if (currentIdx !== -1 && currentIdx < stageFlow.length - 1) {
      updateCandidateStage(id, stageFlow[currentIdx + 1]);
    }
  };

  const failStage = (id: string) => {
    updateCandidateStage(id, 'rejected');
  };

  // Directory filter
  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute computed ranking
  // Rank index score = (Resume * 0.4) + (Match * 0.3) + (Interview * 0.3)
  const getRankScore = (c: Candidate) => {
    return Math.round((c.resumeScore * 0.4) + (c.matchScore * 0.3) + (c.interviewScore * 0.3));
  };

  const rankedCandidates = [...candidates].sort((a, b) => getRankScore(b) - getRankScore(a));

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo bottom-10 right-10 animate-pulse-slow"></div>
      <div className="glow-orb-cyan top-10 left-10 animate-pulse-slow"></div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header and Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-white">Recruiter Management Suite</h1>
            <p className="text-brand-silver text-xs mt-0.5">Manage job applications, screen resumes, and review scores.</p>
          </div>
          
          <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'kanban' ? 'bg-brand-indigo text-white shadow-md' : 'text-brand-silver hover:text-white'
              }`}
            >
              ATS Kanban Board
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'directory' ? 'bg-brand-indigo text-white shadow-md' : 'text-brand-silver hover:text-white'
              }`}
            >
              Candidate Directory
            </button>
            <button
              onClick={() => setActiveTab('ranking')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'ranking' ? 'bg-brand-indigo text-white shadow-md' : 'text-brand-silver hover:text-white'
              }`}
            >
              Smart Candidate Ranking
            </button>
          </div>
        </div>

        {/* 1. Kanban Board view */}
        {activeTab === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
            {columns.map((col) => {
              const colCandidates = candidates.filter(c => c.stage === col.id);
              return (
                <div key={col.id} className="flex flex-col min-w-[200px] gap-3">
                  {/* Column Header */}
                  <div className={`border-b-2 ${col.color} pb-2 flex justify-between items-center px-1`}>
                    <span className="text-xs font-bold text-white capitalize">{col.label}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 text-brand-silver rounded-full">
                      {colCandidates.length}
                    </span>
                  </div>

                  {/* Column Content */}
                  <div className="space-y-3 min-h-[300px]">
                    {colCandidates.map((c) => (
                      <div 
                        key={c.id} 
                        className="glass-panel p-3 bg-brand-dark/25 hover:border-brand-cyan/20 transition group flex flex-col justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-white mb-0.5 truncate">{c.name}</div>
                          <div className="text-[10px] text-brand-silver truncate">{c.title}</div>
                        </div>

                        {/* Scores preview */}
                        <div className="flex gap-2 mt-3 text-[9px] font-bold">
                          <span className="text-brand-cyan">Res: {c.resumeScore}%</span>
                          <span className="text-brand-indigo">Mat: {c.matchScore}%</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-1.5 mt-3 pt-2 border-t border-brand-border/30">
                          {col.id !== 'rejected' && col.id !== 'selected' && (
                            <>
                              <button 
                                onClick={() => failStage(c.id)}
                                className="p-1 rounded bg-brand-error/10 hover:bg-brand-error/20 text-brand-error text-[9px] font-semibold border border-brand-error/20"
                              >
                                Reject
                              </button>
                              <button 
                                onClick={() => advanceStage(c.id, c.stage)}
                                className="p-1 rounded bg-brand-indigo/20 hover:bg-brand-indigo/30 text-brand-cyan text-[9px] font-semibold border border-brand-indigo/30 flex items-center gap-0.5"
                              >
                                Advance <ArrowRight className="h-2 w-2" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {colCandidates.length === 0 && (
                      <div className="border border-dashed border-white/5 rounded-xl py-8 text-center text-[10px] text-brand-silver italic">
                        Empty column
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Candidate Directory view */}
        {activeTab === 'directory' && (
          <div className="space-y-4">
            
            {/* Search Input bar */}
            <div className="flex max-w-md bg-white/5 border border-white/10 rounded-xl px-3 py-2 items-center gap-2">
              <Search className="h-4 w-4 text-brand-silver" />
              <input
                type="text"
                placeholder="Search candidates by name, job title, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white flex-1"
              />
            </div>

            {/* Grid of details cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.map((c) => (
                <GlassCard key={c.id} className="hover:border-brand-indigo/30 transition flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white">{c.name}</h4>
                        <p className="text-[10px] font-medium text-brand-silver">{c.email} • {c.phone}</p>
                      </div>
                      <span className="capitalize px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold text-white border border-white/10">
                        {c.stage}
                      </span>
                    </div>

                    <div>
                      <div className="text-[10px] text-brand-silver font-semibold uppercase">Profile Title</div>
                      <div className="text-xs font-bold text-white">{c.title} • {c.experience} Experience</div>
                    </div>

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1">
                      {c.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-brand-indigo/10 text-brand-cyan text-[9px] border border-brand-indigo/20 font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Summary indicators */}
                  <div className="grid grid-cols-3 gap-2 border-t border-brand-border/40 pt-3 text-center">
                    <div>
                      <div className="text-[8px] text-brand-silver uppercase">Resume</div>
                      <div className="text-xs font-bold text-brand-cyan">{c.resumeScore}%</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-brand-silver uppercase">Match</div>
                      <div className="text-xs font-bold text-brand-indigo">{c.matchScore}%</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-brand-silver uppercase">Interview</div>
                      <div className="text-xs font-bold text-pink-500">{c.interviewScore > 0 ? `${c.interviewScore}%` : 'Pending'}</div>
                    </div>
                  </div>
                </GlassCard>
              ))}
              {filteredCandidates.length === 0 && (
                <div className="col-span-3 py-12 text-center text-xs text-brand-silver italic">
                  No candidates matched your search criteria.
                </div>
              )}
            </div>

          </div>
        )}

        {/* 3. Candidate Ranking view */}
        {activeTab === 'ranking' && (
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3">
              <Star className="h-4 w-4 text-brand-cyan" />
              <h2 className="text-lg font-bold font-display text-white">Weighted Fit Assessment</h2>
            </div>
            
            <p className="text-xs text-brand-silver leading-relaxed">
              Below is a smart candidate ranking index. The weighted algorithm aggregates: 
              <strong className="text-white"> 40% Resume Score</strong>, 
              <strong className="text-white"> 30% Job Match score</strong>, and 
              <strong className="text-white"> 30% Mock Interview score</strong> to determine final rank.
            </p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border text-brand-silver uppercase font-semibold">
                    <th className="pb-3 pl-2">Rank</th>
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Resume</th>
                    <th className="pb-3">Job Match</th>
                    <th className="pb-3">Interview</th>
                    <th className="pb-3 pr-2">Weighted Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 font-medium">
                  {rankedCandidates.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-white/5 transition">
                      <td className="py-3 pl-2 text-white font-mono font-bold">#{idx + 1}</td>
                      <td className="py-3">
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-[10px] text-brand-silver">{c.title}</div>
                      </td>
                      <td className="py-3 text-brand-cyan">{c.resumeScore}%</td>
                      <td className="py-3 text-brand-indigo">{c.matchScore}%</td>
                      <td className="py-3 text-pink-500">{c.interviewScore > 0 ? `${c.interviewScore}%` : 'Pending (0%)'}</td>
                      <td className="py-3 pr-2">
                        <span className="px-2 py-1 rounded bg-brand-cyan/15 border border-brand-cyan/35 text-brand-cyan font-extrabold text-[10px]">
                          {getRankScore(c)} pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

      </div>
    </div>
  );
};
