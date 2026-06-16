// e:/AI Talent OS/src/pages/SkillGapDetector/SkillGapDetector.tsx
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { Sparkles, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const SkillGapDetector: React.FC = () => {
  const { userProfile, updateUserProfile } = useStore();
  const [target, setTarget] = useState(userProfile.targetRole);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  
  const [matchData, setMatchData] = useState<{
    matching: string[];
    missing: string[];
    priority: { skill: string; difficulty: string; resource: string }[];
  } | null>(null);

  const rolesRequiredSkills: Record<string, string[]> = {
    'AI Engineer': ['Python', 'SQL', 'PyTorch', 'TensorFlow', 'Docker', 'AWS', 'LangChain', 'Vector DBs'],
    'ML Engineer': ['Python', 'SQL', 'PyTorch', 'C++', 'CUDA', 'Docker', 'Kubernetes', 'MLflow'],
    'Data Scientist': ['Python', 'R', 'SQL', 'Pandas', 'Scikit-Learn', 'Tableau', 'StatsModels'],
    'Full Stack Developer': ['TypeScript', 'React', 'Node.js', 'SQL', 'Git', 'CSS', 'Tailwind CSS', 'Docker']
  };

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const targetSkills = rolesRequiredSkills[target] || rolesRequiredSkills['AI Engineer'];
      const current = userProfile.skills.map(s => s.toLowerCase());
      
      const matching = targetSkills.filter(s => current.includes(s.toLowerCase()));
      const missing = targetSkills.filter(s => !current.includes(s.toLowerCase()));
      
      const priority = missing.map(s => {
        let difficulty = 'Medium';
        let resource = `Introduction to ${s}`;
        if (['CUDA', 'Kubernetes', 'PyTorch'].includes(s)) difficulty = 'Hard';
        if (['Git', 'CSS', 'SQL'].includes(s)) difficulty = 'Easy';
        return { skill: s, difficulty, resource };
      });

      setMatchData({ matching, missing, priority });
      
      // Update store details
      updateUserProfile({
        targetRole: target,
        missingSkills: missing
      });

      setAnalyzed(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo top-10 left-10 animate-pulse-slow"></div>
      <div className="glow-orb-cyan bottom-10 right-10 animate-pulse-slow"></div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">AI Skill Gap Detector</h1>
          <p className="text-brand-silver text-sm mt-1">
            Compare candidate proficiencies with target parameters to extract development tasks.
          </p>
        </div>

        {/* Configuration details */}
        <GlassCard>
          <form onSubmit={handleRunAnalysis} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-brand-silver mb-1.5">Target Job Role</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-cyan transition font-semibold"
              >
                {Object.keys(rolesRequiredSkills).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-indigo hover:bg-brand-indigo/80 disabled:opacity-50 text-white font-bold text-xs transition shadow-[0_0_15px_rgba(63,78,255,0.3)] shrink-0"
            >
              {loading ? "Analyzing Gaps..." : "Compare Skills"}
            </button>
          </form>
        </GlassCard>

        {/* Results Block */}
        {analyzed && matchData && !loading && (
          <div className="space-y-6">
            
            {/* Grid comparisons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Matching */}
              <GlassCard className="space-y-4">
                <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                  <CheckCircle2 className="h-4 w-4 text-brand-success" />
                  <h3 className="font-display font-extrabold text-sm text-white">Acquired Competencies</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {matchData.matching.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-brand-success/5 border border-brand-success/15 rounded-lg text-xs text-brand-success font-medium">
                      <span>✓</span> {skill}
                    </div>
                  ))}
                  {matchData.matching.length === 0 && (
                    <div className="col-span-2 text-xs text-brand-silver text-center py-4">No matching skills identified.</div>
                  )}
                </div>
              </GlassCard>

              {/* Missing */}
              <GlassCard className="space-y-4">
                <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                  <XCircle className="h-4 w-4 text-brand-error" />
                  <h3 className="font-display font-extrabold text-sm text-white">Missing Competencies</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {matchData.missing.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-brand-error/5 border border-brand-error/15 rounded-lg text-xs text-brand-error font-medium">
                      <span>✕</span> {skill}
                    </div>
                  ))}
                  {matchData.missing.length === 0 && (
                    <div className="col-span-2 text-xs text-brand-success text-center py-4">All target skills acquired!</div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Structured Learning Roadmap */}
            <GlassCard className="space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                <Sparkles className="h-4 w-4 text-brand-cyan" />
                <h3 className="font-display font-extrabold text-sm text-white">Recommended Study Roadmap</h3>
              </div>
              
              <div className="space-y-3">
                {matchData.priority.map((p, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-brand-indigo/30 transition">
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-brand-indigo/10 text-brand-cyan border border-brand-indigo/20 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{p.skill}</h4>
                        <p className="text-[10px] text-brand-silver">Suggested: {p.resource}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        p.difficulty === 'Hard' ? 'bg-brand-error/15 text-brand-error border border-brand-error/25' :
                        p.difficulty === 'Medium' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/25' :
                        'bg-brand-success/15 text-brand-success border border-brand-success/25'
                      }`}>
                        {p.difficulty}
                      </span>
                      <ArrowRight className="hidden sm:block h-3.5 w-3.5 text-brand-silver" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>
        )}

      </div>
    </div>
  );
};
