// e:/AI Talent OS/src/pages/JobMatcher/JobMatcher.tsx
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { getGeminiClient } from '../../services/geminiService';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { Briefcase, Bookmark } from 'lucide-react';

export const JobMatcher: React.FC = () => {
  const { userProfile, jobs, toggleSaveJob, applyForJob, apiSettings } = useStore();
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    score: number;
    matching: string[];
    missing: string[];
    rating: string;
    details: string;
  } | null>(null);

  const handleRunMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    setLoading(true);

    try {
      const gemini = getGeminiClient(apiSettings.geminiKey, apiSettings.isSimulator);
      const res = await gemini.matchJob(userProfile.skills, jobDescription);
      
      setMatchResult({
        score: res.matchPercentage,
        matching: res.matchingSkills,
        missing: res.missingSkills,
        rating: res.suitabilityRating,
        details: res.suitabilityDetails
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo top-20 right-10 animate-pulse-slow"></div>
      <div className="glow-orb-cyan bottom-20 left-10 animate-pulse-slow"></div>

      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">AI Job Matcher</h1>
          <p className="text-brand-silver text-sm mt-1">
            Validate candidate skills against live job descriptions or browse recommended positions.
          </p>
        </div>

        {/* Custom Job Matching Input Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold font-display text-white">Compare Job Description</h2>
            <form onSubmit={handleRunMatch} className="space-y-4">
              <textarea
                placeholder="Paste the target job description details here (e.g. requirements, daily responsibilities, tool stacks)..."
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl p-4 text-xs text-white outline-none focus:border-brand-cyan transition font-mono"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !jobDescription.trim()}
                  className="px-5 py-2.5 rounded-xl bg-brand-indigo hover:bg-brand-indigo/80 disabled:opacity-50 text-white font-bold text-xs transition shadow-[0_0_15px_rgba(63,78,255,0.3)]"
                >
                  {loading ? "Matching..." : "Compare Alignment"}
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Alignment Output Cards */}
          <GlassCard className="flex flex-col justify-center items-center text-center">
            {loading ? (
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin mx-auto"></div>
                <p className="text-xs text-brand-silver">AI evaluating alignment metrics...</p>
              </div>
            ) : matchResult ? (
              <div className="space-y-4 w-full">
                <span className="text-xs font-semibold text-brand-silver uppercase tracking-wider block">Match Rating</span>
                <div className="text-5xl font-extrabold font-display text-brand-cyan">{matchResult.score}%</div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold border" style={{
                  borderColor: matchResult.rating === 'High' ? '#10b981' : matchResult.rating === 'Medium' ? '#f59e0b' : '#ef4444',
                  color: matchResult.rating === 'High' ? '#10b981' : matchResult.rating === 'Medium' ? '#f59e0b' : '#ef4444',
                }}>
                  {matchResult.rating} Suitability
                </div>
                <p className="text-xs text-brand-silver leading-relaxed border-t border-brand-border/40 pt-3">
                  {matchResult.details}
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-brand-silver p-4">
                <Briefcase className="h-8 w-8 text-brand-indigo mx-auto" />
                <p className="text-xs font-semibold">Paste job text on the left to calculate matching percentages.</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Recommended Jobs List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display text-white border-b border-brand-border pb-3">AI Recommended Positions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => {
              const hasApplied = job.status === 'applied';
              const isSaved = job.status === 'saved';

              return (
                <GlassCard key={job.id} className="flex flex-col justify-between space-y-4 hover:border-brand-indigo/35 transition">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-base text-white">{job.title}</h3>
                        <p className="text-xs font-medium text-brand-cyan">{job.company}</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-brand-indigo/10 border border-brand-indigo/20 text-[10px] font-bold text-brand-cyan">
                        {job.matchScore}% Match
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-brand-silver">
                      <span>📍 {job.location}</span>
                      <span>💰 {job.salary}</span>
                    </div>

                    <p className="text-xs text-brand-silver leading-relaxed line-clamp-2">
                      {job.description}
                    </p>
                  </div>

                  {/* Skills lists */}
                  <div className="flex flex-wrap gap-1">
                    {job.matchingSkills.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-brand-success/10 text-brand-success text-[9px] font-bold border border-brand-success/20">
                        ✓ {s}
                      </span>
                    ))}
                    {job.missingSkills.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-brand-error/10 text-brand-error text-[9px] font-bold border border-brand-error/20">
                        ⚠ {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-2 border-t border-brand-border/40">
                    <button
                      onClick={() => toggleSaveJob(job.id)}
                      className={`p-2 rounded-lg border transition ${
                        isSaved 
                          ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan' 
                          : 'border-white/10 text-brand-silver hover:bg-white/5'
                      }`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => applyForJob(job.id)}
                      disabled={hasApplied}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                        hasApplied 
                          ? 'bg-brand-success/10 border border-brand-success/20 text-brand-success cursor-default' 
                          : 'bg-brand-indigo hover:bg-brand-indigo/80 text-white shadow-[0_0_10px_rgba(63,78,255,0.25)]'
                      }`}
                    >
                      {hasApplied ? "Applied Successfully" : "One-Click Apply"}
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
