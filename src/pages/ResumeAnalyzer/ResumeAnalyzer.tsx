// e:/AI Talent OS/src/pages/ResumeAnalyzer/ResumeAnalyzer.tsx
import React, { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import type { DeepResumeAnalysis } from '../../store/useStore';
import { getGeminiClient } from '../../services/geminiService';
import { parseResume } from '../../services/resumeParser';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import {
  FileUp, Sparkles, Check, AlertTriangle, Lightbulb, FileText,
  ShieldCheck, Briefcase, Target, GraduationCap, Star, Eye,
  ArrowRight, RefreshCw, Copy, CheckCircle, XCircle, Minus,
  TrendingUp, BookOpen, Zap, ChevronRight
} from 'lucide-react';

type TabId = 'overview' | 'ats' | 'skills' | 'strengths' | 'role' | 'improvements' | 'recruiter' | 'learning';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: 'ats', label: 'ATS Report', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  { id: 'skills', label: 'Skills', icon: <Zap className="h-3.5 w-3.5" /> },
  { id: 'strengths', label: 'Strengths', icon: <Star className="h-3.5 w-3.5" /> },
  { id: 'role', label: 'Role Match', icon: <Target className="h-3.5 w-3.5" /> },
  { id: 'improvements', label: 'Improvements', icon: <Lightbulb className="h-3.5 w-3.5" /> },
  { id: 'recruiter', label: 'Recruiter View', icon: <Eye className="h-3.5 w-3.5" /> },
  { id: 'learning', label: 'Learning Path', icon: <GraduationCap className="h-3.5 w-3.5" /> },
];

const TARGET_ROLES = [
  'AI Engineer', 'Machine Learning Engineer', 'Data Scientist',
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'DevOps Engineer', 'Cyber Security Analyst', 'UI UX Designer', 'Product Manager',
];

const LOADING_STEPS = [
  'Extracting text from document...',
  'Parsing resume sections...',
  'Running ATS compatibility check...',
  'Analyzing skill categories...',
  'Evaluating project portfolio...',
  'Generating role-match analysis...',
  'Building recruiter perspective...',
  'Compiling recommendations...',
];

// ── Score Ring Component ──────────────────────────────────────
const ScoreRing: React.FC<{
  score: number; label: string; size?: number; strokeColor?: string; sublabel?: string;
}> = ({ score, label, size = 120, strokeColor = '#00E5FF', sublabel }) => {
  const radius = (size / 2) - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * score) / 100;
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} className="stroke-white/5 fill-none" strokeWidth="7" />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            className="fill-none transition-all duration-1000"
            stroke={strokeColor}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-2xl font-extrabold text-white font-display">{score}</span>
      </div>
      <span className="text-[10px] font-semibold text-brand-silver uppercase tracking-wider mt-2">{label}</span>
      {sublabel && <span className="text-[9px] text-brand-silver/60 mt-0.5">{sublabel}</span>}
    </div>
  );
};

// ── Skill Tag Component ──────────────────────────────────────
const SkillTag: React.FC<{ skill: string; color: string }> = ({ skill, color }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${color}`}>
    {skill}
  </span>
);

export const ResumeAnalyzer: React.FC = () => {
  const {
    userProfile, updateUserProfile, apiSettings, setActivePage, setResumeAnalysis
  } = useStore();

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedRole, setSelectedRole] = useState(userProfile.targetRole || 'AI Engineer');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analysis = userProfile.resumeAnalysis;

  const triggerFileSelect = () => fileInputRef.current?.click();

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(pdf|docx|txt)$/i)) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }
    setError('');
    setLoading(true);
    setLoadingStep(0);

    try {
      // Step 1: Parse file
      const stepInterval = setInterval(() => {
        setLoadingStep(prev => Math.min(prev + 1, LOADING_STEPS.length - 1));
      }, 400);

      const parsed = await parseResume(file);

      // Step 2: Deep AI analysis
      const gemini = getGeminiClient(apiSettings.geminiKey, apiSettings.isSimulator);
      const result = await gemini.deepAnalyzeResume(parsed.text, selectedRole);

      clearInterval(stepInterval);

      // Store analysis
      setResumeAnalysis(result);
      updateUserProfile({
        resumeUploaded: true,
        resumeFileName: file.name,
        resumeScore: result.overallScore,
        atsScore: result.atsScore,
        skills: [...new Set([
          ...userProfile.skills,
          ...result.extractedSkills.programmingLanguages,
          ...result.extractedSkills.aiMl,
          ...result.extractedSkills.cloud,
          ...result.extractedSkills.frameworks,
        ])],
        missingSkills: result.roleMatch.missingSkills,
        improvements: result.improvements.map(i => i.after),
        resumeRawText: parsed.text,
        parsedResume: result.parsedData,
      });

      setActiveTab('overview');
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Error occurred during resume analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleFindJobs = () => {
    if (analysis) {
      updateUserProfile({
        skills: [...new Set([
          ...userProfile.skills,
          ...analysis.extractedSkills.programmingLanguages,
          ...analysis.extractedSkills.aiMl,
          ...analysis.extractedSkills.frameworks,
        ])],
        targetRole: selectedRole,
      });
      setActivePage('matcher');
    }
  };

  // ── Tab Content Renderers ──────────────────────────────────
  const renderOverview = (a: DeepResumeAnalysis) => (
    <div className="space-y-6">
      {/* 5 Score Rings */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <GlassCard className="flex items-center justify-center !p-6">
          <ScoreRing score={a.overallScore} label="Overall Score" strokeColor="#00E5FF" />
        </GlassCard>
        <GlassCard className="flex items-center justify-center !p-6">
          <ScoreRing score={a.atsScore} label="ATS Score" strokeColor="#3F4EFF" />
        </GlassCard>
        <GlassCard className="flex items-center justify-center !p-6">
          <ScoreRing score={a.technicalStrengthScore} label="Technical" strokeColor="#EC4899" />
        </GlassCard>
        <GlassCard className="flex items-center justify-center !p-6">
          <ScoreRing score={a.projectQualityScore} label="Projects" strokeColor="#F59E0B" />
        </GlassCard>
        <GlassCard className="flex items-center justify-center !p-6">
          <ScoreRing score={a.recruiterReadinessScore} label="Recruiter Ready" strokeColor="#10B981" />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Info */}
        <GlassCard className="space-y-4">
          <span className="text-xs font-semibold text-brand-silver uppercase tracking-wider">Document Info</span>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <FileText className="h-8 w-8 text-brand-cyan" />
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{userProfile.resumeFileName}</div>
              <div className="text-[10px] text-brand-silver">AI-Analyzed • {new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <button onClick={triggerFileSelect} className="w-full py-2.5 rounded-xl border border-brand-indigo/30 bg-brand-indigo/10 text-brand-cyan hover:bg-brand-indigo/20 text-xs font-bold transition">
            Re-upload Resume
          </button>
        </GlassCard>

        {/* Quick Summary */}
        <GlassCard className="space-y-4">
          <span className="text-xs font-semibold text-brand-silver uppercase tracking-wider">AI Summary</span>
          <p className="text-xs text-brand-silver leading-relaxed">{a.parsedData.summary}</p>
          <div className="flex items-center gap-2 text-[10px]">
            <span className={`px-2 py-0.5 rounded font-bold ${
              a.roleMatch.hiringReadiness === 'Ready' ? 'bg-brand-success/10 text-brand-success' :
              a.roleMatch.hiringReadiness === 'Almost Ready' ? 'bg-brand-cyan/10 text-brand-cyan' :
              'bg-amber-500/10 text-amber-500'
            }`}>
              {a.roleMatch.hiringReadiness}
            </span>
            <span className="text-brand-silver">for {selectedRole}</span>
          </div>
          <button onClick={handleFindJobs} className="w-full py-2.5 rounded-xl bg-brand-indigo text-white font-bold text-xs hover:bg-brand-indigo/80 transition flex items-center justify-center gap-1.5">
            Find Matching Jobs <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </GlassCard>
      </div>
    </div>
  );

  const renderATS = (a: DeepResumeAnalysis) => (
    <div className="space-y-6">
      {/* Keyword Density */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <ShieldCheck className="h-4 w-4 text-brand-cyan" />
          <h3 className="font-display font-extrabold text-sm text-white">Keyword Density Analysis</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {a.atsReport.keywordDensity.map((kd, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-xs font-semibold text-white">{kd.keyword}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-brand-silver">{kd.count}x</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  kd.status === 'good' ? 'bg-brand-success/10 text-brand-success' :
                  kd.status === 'low' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-brand-error/10 text-brand-error'
                }`}>{kd.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Missing Keywords */}
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="font-display font-extrabold text-sm text-white">Missing Keywords</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {a.atsReport.missingKeywords.map((kw, i) => (
              <span key={i} className="text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2.5 py-1 rounded-lg">
                {kw}
              </span>
            ))}
            {a.atsReport.missingKeywords.length === 0 && (
              <span className="text-xs text-brand-success">All critical keywords present!</span>
            )}
          </div>
        </GlassCard>

        {/* Formatting Issues */}
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <XCircle className="h-4 w-4 text-brand-error" />
            <h3 className="font-display font-extrabold text-sm text-white">Formatting Issues</h3>
          </div>
          <ul className="space-y-2">
            {a.atsReport.formattingIssues.map((issue, i) => (
              <li key={i} className="text-xs text-brand-silver flex items-start gap-2">
                <Minus className="h-3 w-3 text-brand-error mt-0.5 shrink-0" />
                <span>{issue}</span>
              </li>
            ))}
            {a.atsReport.formattingIssues.length === 0 && (
              <li className="text-xs text-brand-success flex items-center gap-2">
                <CheckCircle className="h-3 w-3" /> No formatting issues detected
              </li>
            )}
          </ul>
        </GlassCard>
      </div>

      {/* Section Analysis */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <FileText className="h-4 w-4 text-brand-indigo" />
          <h3 className="font-display font-extrabold text-sm text-white">Section Analysis</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {a.atsReport.sectionAnalysis.map((sec, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2">
                {sec.found ? <CheckCircle className="h-3.5 w-3.5 text-brand-success" /> : <XCircle className="h-3.5 w-3.5 text-brand-error" />}
                <span className="text-xs font-semibold text-white">{sec.section}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                sec.quality === 'strong' ? 'bg-brand-success/10 text-brand-success' :
                sec.quality === 'adequate' ? 'bg-brand-cyan/10 text-brand-cyan' :
                sec.quality === 'weak' ? 'bg-amber-500/10 text-amber-500' :
                'bg-brand-error/10 text-brand-error'
              }`}>{sec.quality.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );

  const renderSkills = (a: DeepResumeAnalysis) => {
    const categories: { label: string; skills: string[]; color: string }[] = [
      { label: 'Programming Languages', skills: a.extractedSkills.programmingLanguages, color: 'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan' },
      { label: 'AI / Machine Learning', skills: a.extractedSkills.aiMl, color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
      { label: 'Cloud Platforms', skills: a.extractedSkills.cloud, color: 'bg-brand-indigo/10 border-brand-indigo/20 text-brand-indigo' },
      { label: 'Databases', skills: a.extractedSkills.databases, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
      { label: 'Tools & DevOps', skills: a.extractedSkills.tools, color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
      { label: 'Frameworks', skills: a.extractedSkills.frameworks, color: 'bg-pink-500/10 border-pink-500/20 text-pink-400' },
      { label: 'Soft Skills', skills: a.extractedSkills.softSkills, color: 'bg-teal-500/10 border-teal-500/20 text-teal-400' },
    ];
    return (
      <div className="space-y-4">
        {categories.map((cat, i) => (
          cat.skills.length > 0 && (
            <GlassCard key={i} className="space-y-3">
              <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">{cat.label}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill, j) => <SkillTag key={j} skill={skill} color={cat.color} />)}
              </div>
            </GlassCard>
          )
        ))}
        <div className="text-center text-[10px] text-brand-silver mt-2">
          {Object.values(a.extractedSkills).flat().length} skills detected across {categories.filter(c => c.skills.length > 0).length} categories
        </div>
      </div>
    );
  };

  const renderStrengths = (a: DeepResumeAnalysis) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <CheckCircle className="h-4 w-4 text-brand-success" />
          <h3 className="font-display font-extrabold text-sm text-white">Strengths</h3>
        </div>
        <ul className="space-y-3">
          {a.strengths.map((s, i) => (
            <li key={i} className="text-xs text-brand-silver flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-full bg-brand-success/10 border border-brand-success/20 flex items-center justify-center text-brand-success shrink-0">
                <Check className="h-3 w-3" />
              </span>
              <span className="pt-0.5 leading-relaxed">{s}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="font-display font-extrabold text-sm text-white">Weaknesses</h3>
        </div>
        <ul className="space-y-3">
          {a.weaknesses.map((w, i) => (
            <li key={i} className="text-xs text-brand-silver flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <AlertTriangle className="h-3 w-3" />
              </span>
              <span className="pt-0.5 leading-relaxed">{w}</span>
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* Portfolio Evaluation */}
      <GlassCard className="md:col-span-2 space-y-4">
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <Briefcase className="h-4 w-4 text-brand-indigo" />
          <h3 className="font-display font-extrabold text-sm text-white">Portfolio Evaluation</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {a.portfolioEvaluation.map((proj, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white">{proj.project}</h4>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div><span className="text-brand-silver">Innovation:</span> <span className="text-white font-bold">{proj.innovationScore}/100</span></div>
                <div><span className="text-brand-silver">Technical:</span> <span className="text-white font-bold">{proj.technicalDepth}/100</span></div>
                <div><span className="text-brand-silver">Relevance:</span> <span className="text-white font-bold">{proj.industryRelevance}/100</span></div>
                <div><span className="text-brand-silver">Appeal:</span> <span className="text-white font-bold">{proj.recruiterAppeal}/100</span></div>
              </div>
              <p className="text-[10px] text-brand-silver leading-relaxed italic">{proj.recommendation}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );

  const renderRoleMatch = (a: DeepResumeAnalysis) => (
    <div className="space-y-6">
      <GlassCard className="flex flex-col sm:flex-row items-center justify-between gap-6 !p-8">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-display font-extrabold text-white">Role Match Analysis</h3>
          <p className="text-xs text-brand-silver mt-1">Comparing your resume against: <strong className="text-brand-cyan">{selectedRole}</strong></p>
          <div className="mt-3">
            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
              a.roleMatch.hiringReadiness === 'Ready' ? 'bg-brand-success/10 text-brand-success border border-brand-success/20' :
              a.roleMatch.hiringReadiness === 'Almost Ready' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20' :
              a.roleMatch.hiringReadiness === 'Needs Work' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
              'bg-brand-error/10 text-brand-error border border-brand-error/20'
            }`}>
              {a.roleMatch.hiringReadiness}
            </span>
          </div>
        </div>
        <ScoreRing score={a.roleMatch.matchPercentage} label="Match Score" size={140} strokeColor="#3F4EFF" />
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <XCircle className="h-4 w-4 text-brand-error" />
            <h3 className="font-display font-extrabold text-sm text-white">Missing Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {a.roleMatch.missingSkills.map((s, i) => (
              <span key={i} className="text-xs font-semibold bg-brand-error/10 border border-brand-error/20 text-brand-error px-2.5 py-1 rounded-lg">{s}</span>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <TrendingUp className="h-4 w-4 text-brand-success" />
            <h3 className="font-display font-extrabold text-sm text-white">Recommended Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {a.roleMatch.recommendedSkills.map((s, i) => (
              <span key={i} className="text-xs font-semibold bg-brand-success/10 border border-brand-success/20 text-brand-success px-2.5 py-1 rounded-lg">{s}</span>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderImprovements = (a: DeepResumeAnalysis) => (
    <div className="space-y-6">
      {/* Before/After Cards */}
      {a.improvements.map((imp, i) => (
        <GlassCard key={i} className="space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-brand-cyan" />
              <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">
                {imp.category.replace('_', ' ')}
              </h3>
            </div>
            <span className="text-[9px] text-brand-silver italic">{imp.reason}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-brand-error/5 border border-brand-error/10">
              <span className="text-[10px] font-bold text-brand-error uppercase">Before</span>
              <p className="text-xs text-brand-silver mt-1.5 leading-relaxed">{imp.before}</p>
            </div>
            <div className="p-3 rounded-lg bg-brand-success/5 border border-brand-success/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-success uppercase">After</span>
                <button
                  onClick={() => copyToClipboard(imp.after, i)}
                  className="text-brand-silver hover:text-white transition"
                >
                  {copiedIndex === i ? <Check className="h-3 w-3 text-brand-success" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <p className="text-xs text-brand-silver mt-1.5 leading-relaxed">{imp.after}</p>
            </div>
          </div>
        </GlassCard>
      ))}

      {/* AI Rewrite */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <RefreshCw className="h-4 w-4 text-brand-indigo" />
          <h3 className="font-display font-extrabold text-sm text-white">AI Resume Rewrite</h3>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-brand-indigo/5 border border-brand-indigo/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-indigo uppercase">Suggested Summary</span>
              <button onClick={() => copyToClipboard(a.rewriteSuggestions.summaryRewrite, 100)} className="text-brand-silver hover:text-white transition">
                {copiedIndex === 100 ? <Check className="h-3 w-3 text-brand-success" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <p className="text-xs text-brand-silver mt-1.5 leading-relaxed">{a.rewriteSuggestions.summaryRewrite}</p>
          </div>

          <span className="block text-[10px] font-semibold text-brand-silver uppercase tracking-wider mt-4">Achievement Statements</span>
          {a.rewriteSuggestions.achievementStatements.map((stmt, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <Star className="h-3 w-3 text-brand-cyan mt-0.5 shrink-0" />
              <span className="text-xs text-brand-silver leading-relaxed flex-1">{stmt}</span>
              <button onClick={() => copyToClipboard(stmt, 200 + i)} className="text-brand-silver hover:text-white transition shrink-0">
                {copiedIndex === 200 + i ? <Check className="h-3 w-3 text-brand-success" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );

  const renderRecruiterView = (a: DeepResumeAnalysis) => (
    <div className="space-y-6">
      <GlassCard className="!p-8">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="h-5 w-5 text-brand-cyan" />
          <h3 className="font-display font-extrabold text-lg text-white">Recruiter Perspective</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col items-center">
            <ScoreRing score={a.recruiterView.shortlistProbability} label="Shortlist Probability" size={130} strokeColor="#3F4EFF" />
          </div>
          <div className="flex flex-col items-center">
            <ScoreRing score={a.recruiterView.interviewProbability} label="Interview Probability" size={130} strokeColor="#10B981" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <span className="text-[10px] font-semibold text-brand-silver uppercase tracking-wider">Verdict</span>
          <p className="text-sm text-white font-semibold mt-1.5">{a.recruiterView.overallVerdict}</p>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <CheckCircle className="h-4 w-4 text-brand-success" />
            <h3 className="font-display font-extrabold text-sm text-white">Strength Areas</h3>
          </div>
          <ul className="space-y-2">
            {a.recruiterView.strengthAreas.map((s, i) => (
              <li key={i} className="text-xs text-brand-silver flex items-start gap-2">
                <Check className="h-3 w-3 text-brand-success mt-0.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <AlertTriangle className="h-4 w-4 text-brand-error" />
            <h3 className="font-display font-extrabold text-sm text-white">Risk Areas</h3>
          </div>
          <ul className="space-y-2">
            {a.recruiterView.riskAreas.map((r, i) => (
              <li key={i} className="text-xs text-brand-silver flex items-start gap-2">
                <XCircle className="h-3 w-3 text-brand-error mt-0.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );

  const renderLearningPath = (a: DeepResumeAnalysis) => (
    <div className="space-y-4">
      <GlassCard className="!p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-brand-cyan" />
          <span className="text-xs font-semibold text-brand-silver">
            Personalized learning roadmap based on {a.learningPath.length} missing skills for <strong className="text-white">{selectedRole}</strong>
          </span>
        </div>
      </GlassCard>

      {a.learningPath.map((lp, i) => (
        <GlassCard key={i} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <div className="h-6 w-6 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center text-[10px] text-brand-cyan font-bold">
              {i + 1}
            </div>
            <h3 className="font-display font-extrabold text-sm text-white">{lp.skill}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-brand-cyan uppercase">Courses</span>
              {lp.courses.map((c, j) => (
                <div key={j} className="text-xs text-brand-silver flex items-start gap-1.5">
                  <ChevronRight className="h-3 w-3 text-brand-indigo mt-0.5 shrink-0" />{c}
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-brand-indigo uppercase">Certifications</span>
              {lp.certifications.map((c, j) => (
                <div key={j} className="text-xs text-brand-silver flex items-start gap-1.5">
                  <ChevronRight className="h-3 w-3 text-brand-indigo mt-0.5 shrink-0" />{c}
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-brand-success uppercase">Projects</span>
              {lp.projects.map((p, j) => (
                <div key={j} className="text-xs text-brand-silver flex items-start gap-1.5">
                  <ChevronRight className="h-3 w-3 text-brand-indigo mt-0.5 shrink-0" />{p}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );

  const renderTabContent = (a: DeepResumeAnalysis) => {
    switch (activeTab) {
      case 'overview': return renderOverview(a);
      case 'ats': return renderATS(a);
      case 'skills': return renderSkills(a);
      case 'strengths': return renderStrengths(a);
      case 'role': return renderRoleMatch(a);
      case 'improvements': return renderImprovements(a);
      case 'recruiter': return renderRecruiterView(a);
      case 'learning': return renderLearningPath(a);
      default: return renderOverview(a);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo top-10 left-10 animate-pulse-slow"></div>
      <div className="glow-orb-cyan bottom-10 right-10 animate-pulse-slow"></div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-white">AI Resume Intelligence</h1>
            <p className="text-brand-silver text-sm mt-1">
              Production-grade ATS analysis, skill extraction, and recruiter-perspective evaluation.
            </p>
          </div>
          {/* Target Role Selector */}
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-brand-cyan" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-brand-dark border border-brand-border text-white text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-brand-cyan transition"
            >
              {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Drop Zone (show when no analysis or always for re-upload) */}
        {!analysis && !loading && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
              isDragging
                ? 'border-brand-cyan bg-brand-cyan/5'
                : 'border-brand-border bg-brand-dark/25 hover:border-brand-indigo/60 hover:bg-brand-indigo/5'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-brand-indigo/10 text-brand-cyan border border-brand-indigo/20">
                <FileUp className="h-8 w-8 animate-bounce" />
              </div>
              <div>
                <p className="text-white font-bold text-base">Drop your resume here for deep AI analysis</p>
                <p className="text-brand-silver text-xs mt-1">Supports PDF, DOCX, or TXT (Max 5MB)</p>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file input when analysis exists */}
        {analysis && (
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.docx,.txt" className="hidden" />
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl border border-brand-error/20 bg-brand-error/10 text-brand-error text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <GlassCard className="py-12 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative inline-flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-brand-indigo/20 border-t-brand-cyan animate-spin"></div>
                <Sparkles className="h-5 w-5 text-brand-cyan animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">{LOADING_STEPS[loadingStep]}</p>
                <p className="text-brand-silver text-[10px] mt-1">Step {loadingStep + 1} of {LOADING_STEPS.length}</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="max-w-sm mx-auto w-full">
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-indigo to-brand-cyan rounded-full transition-all duration-500"
                  style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </GlassCard>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'bg-brand-indigo/20 border border-brand-indigo/40 text-white'
                      : 'bg-white/5 border border-white/10 text-brand-silver hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {renderTabContent(analysis)}
          </div>
        )}
      </div>
    </div>
  );
};
