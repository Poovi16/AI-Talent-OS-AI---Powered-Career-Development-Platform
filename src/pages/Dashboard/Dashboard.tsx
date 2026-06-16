// e:/AI Talent OS/src/pages/Dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { StatCard } from '../../components/StatCard/StatCard';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { 
  Users, 
  FileCheck, 
  Briefcase, 
  Video, 
  GraduationCap, 
  Brain, 
  Plus, 
  Search, 
  ShieldCheck, 
  Key, 
  Terminal,
  ChevronRight
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    activeRole, 
    userProfile, 
    candidates, 
    jobs, 
    learningCourses, 
    setActivePage,
    addCandidate,
    addActivityLog
  } = useStore();

  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  
  // New candidate state
  const [newCandName, setNewCandName] = useState('');
  const [newCandEmail, setNewCandEmail] = useState('');
  const [newCandTitle, setNewCandTitle] = useState('AI Engineer');
  const [newCandSkills, setNewCandSkills] = useState('Python, PyTorch');
  const [newCandExp, setNewCandExp] = useState('2 Years');

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    addCandidate({
      name: newCandName,
      email: newCandEmail,
      phone: '+1 (555) 736-2810',
      title: newCandTitle,
      skills: newCandSkills.split(',').map(s => s.trim()),
      experience: newCandExp,
      resumeScore: 80,
      matchScore: 85,
      interviewScore: 0,
      stage: 'applied'
    });
    setNewCandName('');
    setNewCandEmail('');
    setShowAddCandidateModal(false);
  };

  // Candidate Dashboard metrics
  const completedCourses = learningCourses.filter(c => c.status === 'completed').length;
  const inProgressCourses = learningCourses.filter(c => c.status === 'in-progress').length;
  const resumeStatusText = userProfile.resumeUploaded 
    ? `Score: ${userProfile.resumeScore || 0}% / ATS: ${userProfile.atsScore || 0}%`
    : 'No Resume Uploaded';

  const renderCandidateDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <GlassCard className="relative overflow-hidden border-brand-indigo/30 bg-gradient-to-r from-brand-indigo/10 via-black to-brand-cyan/5 p-8 glow-indigo">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-brand-indigo/20 filter blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-white">Welcome back, {userProfile.name}</h1>
            <p className="mt-2 text-brand-silver max-w-xl">
              Track your skill development, analyze your resumes, run mock interviews, and view recommendations for your target role: <strong className="text-brand-cyan font-bold">{userProfile.targetRole}</strong>.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setActivePage('analyzer')}
              className="px-5 py-3 rounded-xl bg-brand-indigo text-white font-bold text-sm shadow-[0_0_20px_rgba(63,78,255,0.4)] hover:bg-brand-indigo/80 transition"
            >
              Analyze Resume
            </button>
            <button 
              onClick={() => setActivePage('coach')}
              className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition"
            >
              Talk to AI Coach
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Resume Score" 
          value={userProfile.resumeUploaded ? `${userProfile.resumeScore || 0}/100` : 'N/A'} 
          icon={FileCheck} 
          subtext={resumeStatusText}
          iconColor="text-brand-cyan"
        />
        <StatCard 
          label="Recommended Jobs" 
          value={jobs.length} 
          icon={Briefcase} 
          subtext={`${jobs.filter(j => j.status === 'applied').length} Applied`}
          iconColor="text-brand-indigo"
        />
        <StatCard 
          label="Skill gap" 
          value={userProfile.resumeUploaded ? `${userProfile.missingSkills?.length || 4} Missing` : 'Needs analysis'} 
          icon={Brain} 
          subtext="Skills to reach Target Role"
          iconColor="text-pink-500"
        />
        <StatCard 
          label="Learning Progress" 
          value={`${completedCourses}/${learningCourses.length}`} 
          icon={GraduationCap} 
          subtext={`${inProgressCourses} Active Courses`}
          iconColor="text-brand-success"
        />
      </div>

      {/* Quick Action Guides & Coach Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold font-display text-white">Recommended Next Steps</h2>
          
          <div className="space-y-3">
            {/* Step 1 */}
            <div 
              onClick={() => setActivePage('analyzer')}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-indigo/40 hover:bg-white/10 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${userProfile.resumeUploaded ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-indigo/10 text-brand-indigo'}`}>
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Upload and Analyze Resume</h4>
                  <p className="text-xs text-brand-silver">Check ATS score and extract skills from your PDF/DOCX file.</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-silver" />
            </div>

            {/* Step 2 */}
            <div 
              onClick={() => setActivePage('gap')}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/40 hover:bg-white/10 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-500">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Identify Skill Gaps</h4>
                  <p className="text-xs text-brand-silver">See how your current skill set stacks against AI and ML requirements.</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-silver" />
            </div>

            {/* Step 3 */}
            <div 
              onClick={() => setActivePage('interview')}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-cyan/40 hover:bg-white/10 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-brand-cyan/10 text-brand-cyan">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Interactive Mock Interview</h4>
                  <p className="text-xs text-brand-silver">Simulate tech and behavioral loops and get grading feedback.</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-silver" />
            </div>
          </div>
        </GlassCard>

        {/* AI Career Coach Corner */}
        <GlassCard className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-brand-border pb-3 mb-4">
              <Brain className="h-5 w-5 text-brand-cyan animate-pulse" />
              <h3 className="font-display font-extrabold text-md text-white">Coach Insight</h3>
            </div>
            <p className="text-sm text-brand-silver leading-relaxed italic">
              "Alex, I noticed a 65% alignment with lead engineer openings. To jump to 90%, prioritize completing your course in 'Generative AI & Fine-Tuning' and add LangChain to your resume skills."
            </p>
          </div>
          <button 
            onClick={() => setActivePage('coach')}
            className="mt-6 w-full py-2.5 rounded-xl border border-brand-indigo/30 bg-brand-indigo/10 text-brand-cyan font-bold hover:bg-brand-indigo/20 text-xs transition"
          >
            Launch Assistant
          </button>
        </GlassCard>
      </div>
    </div>
  );

  const renderRecruiterDashboard = () => {
    const activeInterviews = candidates.filter(c => c.stage === 'interview').length;
    const hiredCount = candidates.filter(c => c.stage === 'selected').length;
    return (
      <div className="space-y-6">
        {/* Recruiter Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-white">Talent Acquisition Portal</h1>
            <p className="text-brand-silver text-sm">Active pipelines for recruiter tracking.</p>
          </div>
          <button 
            onClick={() => setShowAddCandidateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-indigo hover:bg-brand-indigo/80 text-white font-bold text-sm transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(63,78,255,0.3)]"
          >
            <Plus className="h-4 w-4" /> Add Candidate
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total Candidates" 
            value={candidates.length} 
            icon={Users} 
            trend={{ value: 12, isPositive: true }}
            subtext="registered in database"
            iconColor="text-brand-cyan"
          />
          <StatCard 
            label="Screening Pipelines" 
            value={candidates.filter(c => c.stage === 'screening' || c.stage === 'applied').length} 
            icon={Search} 
            trend={{ value: 4, isPositive: false }}
            subtext="candidates to review"
            iconColor="text-brand-indigo"
          />
          <StatCard 
            label="Interviews Scheduled" 
            value={activeInterviews} 
            icon={Video} 
            subtext="active calendar items"
            iconColor="text-pink-500"
          />
          <StatCard 
            label="Hired Candidates" 
            value={hiredCount} 
            icon={ShieldCheck} 
            subtext="accepted offer letters"
            iconColor="text-brand-success"
          />
        </div>

        {/* Candidates stage tracker Kanban overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-display text-white">Recent Applicants</h2>
              <button 
                onClick={() => setActivePage('recruiter')} 
                className="text-xs text-brand-cyan hover:underline font-bold"
              >
                View Kanban Board →
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border text-brand-silver uppercase font-semibold">
                    <th className="pb-3 pl-2">Name</th>
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Experience</th>
                    <th className="pb-3">Resume Score</th>
                    <th className="pb-3 pr-2">Pipeline Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 font-medium">
                  {candidates.map((cand) => (
                    <tr key={cand.id} className="hover:bg-white/5 transition">
                      <td className="py-3 pl-2 text-white font-bold">{cand.name}</td>
                      <td className="py-3 text-brand-silver">{cand.title}</td>
                      <td className="py-3 text-brand-silver">{cand.experience}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          cand.resumeScore >= 90 ? 'bg-brand-success/10 text-brand-success' :
                          cand.resumeScore >= 80 ? 'bg-brand-indigo/10 text-brand-indigo' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {cand.resumeScore}%
                        </span>
                      </td>
                      <td className="py-3 pr-2">
                        <span className="capitalize px-2 py-1 rounded bg-white/5 text-white border border-white/10 text-[10px]">
                          {cand.stage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard className="space-y-4">
            <h3 className="font-display font-extrabold text-md text-white border-b border-brand-border pb-3">Recruiter Settings</h3>
            <div className="space-y-2.5">
              <button
                onClick={() => addActivityLog("Recruiter generated database audit export.")}
                className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-brand-silver font-semibold transition"
              >
                Export CSV candidate pool
              </button>
              <button
                onClick={() => addActivityLog("System recalculating matching parameters.")}
                className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-brand-silver font-semibold transition"
              >
                Update AI weights configuration
              </button>
              <button
                onClick={() => setActivePage('analytics')}
                className="w-full text-left p-3 rounded-lg bg-brand-indigo/10 border border-brand-indigo/30 hover:bg-brand-indigo/20 text-xs text-brand-cyan font-bold transition"
              >
                Launch Hiring Funnel Analytics
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  };

  const renderAdminDashboard = () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">System Administration Console</h1>
          <p className="text-brand-silver text-sm">Monitor environment properties, storage blocks, and AI services latency.</p>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="System Health" 
            value="99.9%" 
            icon={ShieldCheck} 
            subtext="Operational"
            iconColor="text-brand-success"
          />
          <StatCard 
            label="Candidates in Storage" 
            value={candidates.length} 
            icon={Users} 
            subtext="Synced to local storage"
            iconColor="text-brand-cyan"
          />
          <StatCard 
            label="Active Job Postings" 
            value={jobs.length} 
            icon={Briefcase} 
            subtext="Configured postings"
            iconColor="text-brand-indigo"
          />
          <StatCard 
            label="API Configuration" 
            value="ONLINE" 
            icon={Key} 
            subtext="Gemini Engine"
            iconColor="text-pink-500"
          />
        </div>

        {/* Admin controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3 mb-3">
              <Terminal className="h-5 w-5 text-brand-cyan" />
              <h2 className="text-lg font-bold font-display text-white">Operational Console Logger</h2>
            </div>
            
            <div className="bg-black/80 rounded-xl p-4 border border-white/5 font-mono text-[11px] text-brand-success space-y-2 max-h-60 overflow-y-auto">
              <div>&gt; _ system_daemon: listening on port 5173</div>
              <div>&gt; _ db_client: initialized connection successfully</div>
              <div>&gt; _ candidate_store: found 5 persisted blocks</div>
              <div>&gt; _ system_state: syncing triggers</div>
              <div>&gt; _ success: dashboard operational. ready.</div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="font-display font-extrabold text-md text-white border-b border-brand-border pb-3">Dev Tools</h3>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  if (confirm("Reset local storage and reload page?")) {
                    useStore.getState().resetStore();
                    window.location.reload();
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-brand-error/30 bg-brand-error/10 text-brand-error hover:bg-brand-error/20 text-xs font-bold transition"
              >
                Reset Database to Defaults
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo top-1/4 left-1/3 animate-pulse-slow"></div>
      <div className="glow-orb-cyan bottom-1/4 right-1/4 animate-pulse-slow"></div>
      
      {activeRole === 'candidate' && renderCandidateDashboard()}
      {activeRole === 'recruiter' && renderRecruiterDashboard()}
      {activeRole === 'admin' && renderAdminDashboard()}

      {/* Add Candidate Modal */}
      {showAddCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 border border-brand-border">
            <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-4">
              <h3 className="font-display font-extrabold text-lg text-white">Register Candidate</h3>
              <button 
                onClick={() => setShowAddCandidateModal(false)}
                className="text-brand-silver hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateCandidate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-silver mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newCandName}
                  onChange={(e) => setNewCandName(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-silver mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. john@doe.com"
                  value={newCandEmail}
                  onChange={(e) => setNewCandEmail(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-silver mb-1">Target Job Title</label>
                <input
                  required
                  type="text"
                  value={newCandTitle}
                  onChange={(e) => setNewCandTitle(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-silver mb-1">Experience Level</label>
                <input
                  required
                  type="text"
                  value={newCandExp}
                  onChange={(e) => setNewCandExp(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-silver mb-1">Skills (comma separated)</label>
                <input
                  required
                  type="text"
                  value={newCandSkills}
                  onChange={(e) => setNewCandSkills(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowAddCandidateModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-brand-silver hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-indigo text-white hover:bg-brand-indigo/80 text-xs font-bold"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
