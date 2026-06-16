// e:/AI Talent OS/src/pages/Learning/Learning.tsx
import React from 'react';
import { useStore } from '../../store/useStore';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { StatCard } from '../../components/StatCard/StatCard';
import { Clock, Award, BookOpen, ExternalLink } from 'lucide-react';

export const Learning: React.FC = () => {
  const { learningCourses, updateCourseProgress } = useStore();

  const totalHours = learningCourses.reduce((acc, c) => acc + c.hours, 0);
  const completedCount = learningCourses.filter(c => c.status === 'completed').length;
  const activeCount = learningCourses.filter(c => c.status === 'in-progress').length;

  const handleProgressChange = (courseId: string, progress: number) => {
    updateCourseProgress(courseId, progress);
  };

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo bottom-20 left-10 animate-pulse-slow"></div>
      <div className="glow-orb-cyan top-20 right-10 animate-pulse-slow"></div>

      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">AI Learning Center</h1>
          <p className="text-brand-silver text-sm mt-1">
            Build missing skills via targeted course programs, workshops, and certifications.
          </p>
        </div>

        {/* Course progress metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard 
            label="Total Study Hours" 
            value={`${totalHours} Hrs`} 
            icon={Clock} 
            subtext="across registered syllabus"
            iconColor="text-brand-cyan"
          />
          <StatCard 
            label="Completed Programs" 
            value={`${completedCount}/${learningCourses.length}`} 
            icon={Award} 
            subtext="certified listings"
            iconColor="text-brand-success"
          />
          <StatCard 
            label="Active Programs" 
            value={activeCount} 
            icon={BookOpen} 
            subtext="currently in progress"
            iconColor="text-brand-indigo"
          />
        </div>

        {/* Curated listings */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display text-white border-b border-brand-border pb-3">Curated Curriculum</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningCourses.map((c) => (
              <GlassCard key={c.id} className="flex flex-col justify-between space-y-4 hover:border-brand-indigo/30 transition">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded bg-brand-indigo/10 text-brand-cyan border border-brand-indigo/20 text-[9px] font-bold">
                      {c.category}
                    </span>
                    <span className="text-[10px] text-brand-silver font-medium">Target: {c.targetSkill}</span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{c.title}</h3>
                  <p className="text-xs text-brand-silver">{c.platform} • {c.hours} hours syllabus</p>
                </div>

                {/* Progress bar and sliders */}
                <div className="space-y-2 pt-2 border-t border-brand-border/40">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-brand-silver font-bold uppercase">Progress: {c.progress}%</span>
                    <span className={`font-semibold capitalize ${
                      c.status === 'completed' ? 'text-brand-success' : c.status === 'in-progress' ? 'text-brand-cyan' : 'text-brand-silver'
                    }`}>
                      {c.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.status === 'completed' ? 'bg-brand-success' : 'bg-brand-cyan'
                      }`}
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>

                  {/* Manual progress sliders */}
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={c.progress}
                      onChange={(e) => handleProgressChange(c.id, parseInt(e.target.value))}
                      className="flex-1 accent-brand-cyan h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                    />
                    
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-brand-silver hover:text-white transition shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

              </GlassCard>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
