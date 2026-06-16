// e:/AI Talent OS/src/pages/ResumeAnalyzer/ResumeAnalyzer.tsx
import React, { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { getGeminiClient } from '../../services/geminiService';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { FileUp, Sparkles, Check, AlertTriangle, Lightbulb, FileText } from 'lucide-react';

export const ResumeAnalyzer: React.FC = () => {
  const { userProfile, updateUserProfile, apiSettings } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.txt')) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Simulate reading or read file text if TXT
      let fileText = '';
      if (file.name.endsWith('.txt')) {
        fileText = await file.text();
      } else {
        fileText = `Mock extracted resume text for file: ${file.name}. Size: ${file.size} bytes. User profile name is ${userProfile.name}.`;
      }

      // Initialize Gemini Client
      const gemini = getGeminiClient(apiSettings.geminiKey, apiSettings.isSimulator);
      const analysis = await gemini.analyzeResume(file.name, fileText);

      updateUserProfile({
        resumeUploaded: true,
        resumeFileName: file.name,
        resumeScore: analysis.score,
        atsScore: analysis.atsScore,
        skills: [...new Set([...userProfile.skills, ...analysis.skills])],
        missingSkills: analysis.missingSkills,
        improvements: analysis.suggestions
      });
      
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Error occurred during resume analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo top-10 left-10 animate-pulse-slow"></div>
      <div className="glow-orb-cyan bottom-10 right-10 animate-pulse-slow"></div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">AI Resume Analyzer</h1>
          <p className="text-brand-silver text-sm mt-1">
            Optimize your resume for applicant tracking systems (ATS) using standard LLM criteria.
          </p>
        </div>

        {/* Drag and Drop Zone */}
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
              <p className="text-white font-bold text-base">Drag and drop your resume here</p>
              <p className="text-brand-silver text-xs mt-1">Supports PDF, DOCX, or TXT (Max 5MB)</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-brand-error/20 bg-brand-error/10 text-brand-error text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <GlassCard className="text-center py-12 space-y-4">
            <div className="relative inline-flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-brand-indigo/20 border-t-brand-cyan animate-spin"></div>
              <Sparkles className="h-5 w-5 text-brand-cyan animate-pulse" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Processing Resume File...</p>
              <p className="text-brand-silver text-xs mt-1">Extracting skill matrices and running ATS assessments.</p>
            </div>
          </GlassCard>
        )}

        {/* Results Panel */}
        {userProfile.resumeUploaded && !loading && (
          <div className="space-y-6">
            
            {/* Score Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Score Circular progress gauge */}
              <GlassCard className="flex flex-col items-center justify-center text-center p-8">
                <span className="text-xs font-semibold text-brand-silver uppercase tracking-wider mb-4">Overall Score</span>
                <div className="relative flex items-center justify-center h-32 w-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="50" className="stroke-white/5 stroke-[8] fill-none" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="50" 
                      className="stroke-brand-cyan stroke-[8] fill-none transition-all duration-1000"
                      strokeDasharray={314}
                      strokeDashoffset={314 - (314 * (userProfile.resumeScore || 0)) / 100}
                    />
                  </svg>
                  <span className="absolute text-3xl font-extrabold text-white font-display">
                    {userProfile.resumeScore || 0}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[10px] text-brand-success font-semibold">
                  <Check className="h-3 w-3" /> Ready for Submissions
                </div>
              </GlassCard>

              {/* ATS Compatibility */}
              <GlassCard className="flex flex-col items-center justify-center text-center p-8">
                <span className="text-xs font-semibold text-brand-silver uppercase tracking-wider mb-4">ATS Compatibility</span>
                <div className="relative flex items-center justify-center h-32 w-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="50" className="stroke-white/5 stroke-[8] fill-none" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="50" 
                      className="stroke-brand-indigo stroke-[8] fill-none transition-all duration-1000"
                      strokeDasharray={314}
                      strokeDashoffset={314 - (314 * (userProfile.atsScore || 0)) / 100}
                    />
                  </svg>
                  <span className="absolute text-3xl font-extrabold text-white font-display">
                    {userProfile.atsScore || 0}%
                  </span>
                </div>
                <div className="mt-4 text-[10px] text-brand-silver font-medium">
                  Matches standard parsing parsers
                </div>
              </GlassCard>

              {/* File details card */}
              <GlassCard className="flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-brand-silver uppercase tracking-wider block mb-3">Document Info</span>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <FileText className="h-8 w-8 text-brand-cyan" />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">{userProfile.resumeFileName}</div>
                      <div className="text-[10px] text-brand-silver">Validated & Analyzed</div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={triggerFileSelect}
                  className="w-full mt-4 py-2.5 rounded-xl border border-brand-indigo/30 bg-brand-indigo/10 text-brand-cyan hover:bg-brand-indigo/20 text-xs font-bold transition"
                >
                  Reupload File
                </button>
              </GlassCard>
            </div>

            {/* Extracted Skills and Improvement Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Extracted skills */}
              <GlassCard className="space-y-4">
                <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                  <Check className="h-4 w-4 text-brand-success" />
                  <h3 className="font-display font-extrabold text-sm text-white">Extracted Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map((skill, i) => (
                    <span 
                      key={i} 
                      className="text-xs font-semibold bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan px-2.5 py-1 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </GlassCard>

              {/* Missing skills */}
              <GlassCard className="space-y-4">
                <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                  <AlertTriangle className="h-4 w-4 text-brand-warning" />
                  <h3 className="font-display font-extrabold text-sm text-white">Missing Target Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userProfile.missingSkills && userProfile.missingSkills.length > 0 ? (
                    userProfile.missingSkills.map((skill, i) => (
                      <span 
                        key={i} 
                        className="text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2.5 py-1 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-brand-silver">All target skills present in document!</span>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Suggestions card */}
            <GlassCard className="space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                <Lightbulb className="h-4 w-4 text-brand-cyan" />
                <h3 className="font-display font-extrabold text-sm text-white">Actionable Suggestions</h3>
              </div>
              <ul className="space-y-3">
                {userProfile.improvements?.map((imp, i) => (
                  <li key={i} className="text-xs text-brand-silver flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center text-[10px] text-brand-cyan shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

          </div>
        )}

      </div>
    </div>
  );
};
