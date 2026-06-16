// e:/AI Talent OS/src/pages/CareerCoach/CareerCoach.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getGeminiClient } from '../../services/geminiService';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { Brain, Send, Trash2, ArrowUpRight } from 'lucide-react';

export const CareerCoach: React.FC = () => {
  const { userProfile, coachMessages, addCoachMessage, clearCoachHistory, apiSettings } = useStore();
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<any[] | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coachMessages]);

  const presetPrompts = [
    { label: "Generate 6-Month Study Roadmap", text: "Please generate a customized study roadmap for transitioning to my target role." },
    { label: "Suggest Portfolio Projects", text: "What portfolio projects should I build to demonstrate capabilities in AI?" },
    { label: "Certifications suggestions", text: "Which certifications are most valuable for machine learning engineering?" }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    // Add user message
    addCoachMessage({ sender: 'user', text: textToSend });
    setUserInput('');
    setLoading(true);
    setActiveRoadmap(null);

    try {
      const gemini = getGeminiClient(apiSettings.geminiKey, apiSettings.isSimulator);
      
      // We pass the conversation context
      const history = [...coachMessages, { id: 'temp', sender: 'user' as const, text: textToSend, timestamp: '' }]
        .map(m => ({ sender: m.sender, text: m.text }));

      const res = await gemini.chatCareerCoach(history, userProfile.skills, userProfile.targetRole);
      
      addCoachMessage({ sender: 'ai', text: res.answer });
      
      if (res.roadmap) {
        setActiveRoadmap(res.roadmap);
      }
    } catch (e) {
      console.error(e);
      addCoachMessage({ sender: 'ai', text: 'Sorry, I encountered an error formulating my guidance. Please make sure the API key is configured or reset database settings.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative flex flex-col justify-between">
      <div className="glow-orb-indigo bottom-1/4 right-1/4 animate-pulse-slow"></div>
      <div className="glow-orb-cyan top-1/4 left-1/4 animate-pulse-slow"></div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col space-y-6 pb-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border pb-4">
          <div>
            <h1 className="text-2xl font-extrabold font-display text-white">AI Career Coach</h1>
            <p className="text-brand-silver text-xs mt-0.5">
              Obtain tailored portfolio construction suggestions and study roadmaps.
            </p>
          </div>
          <button
            onClick={clearCoachHistory}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-brand-error/10 hover:text-brand-error transition text-brand-silver"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Chat log & Roadmap splits */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[350px]">
          
          {/* Chat Messages */}
          <div className="lg:col-span-3 flex flex-col justify-between glass-panel p-4 bg-brand-dark/25 relative overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[420px] scroll-smooth">
              {coachMessages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                  >
                    <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                      isAi ? 'bg-brand-indigo/20 border border-brand-indigo/40 text-brand-cyan' : 'bg-brand-cyan/20 border border-brand-cyan/40 text-white'
                    }`}>
                      {isAi ? 'AI' : 'U'}
                    </div>
                    
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isAi 
                        ? 'bg-white/5 border border-white/10 text-brand-silver' 
                        : 'bg-brand-indigo text-white shadow-md'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className="block text-[8px] text-right mt-1 opacity-40 font-mono">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex gap-3 mr-auto">
                  <div className="h-7 w-7 rounded-full bg-brand-indigo/20 border border-brand-indigo/40 flex items-center justify-center text-xs text-brand-cyan font-bold">
                    AI
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-xs text-brand-silver flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-brand-cyan rounded-full animate-bounce"></span>
                    <span className="h-1.5 w-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input form */}
            <div className="mt-4 pt-3 border-t border-brand-border/40 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask your career query..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(userInput)}
                className="flex-1 bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-brand-cyan"
              />
              <button
                onClick={() => handleSendMessage(userInput)}
                disabled={loading || !userInput.trim()}
                className="p-2.5 rounded-xl bg-brand-indigo hover:bg-brand-indigo/80 disabled:opacity-50 text-white font-bold transition shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Preset Prompts or Roadmap visualizer */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {activeRoadmap ? (
              /* Roadmap panel */
              <GlassCard className="flex-1 overflow-y-auto space-y-4 max-h-[480px]">
                <div className="flex items-center gap-2 border-b border-brand-border pb-3 mb-2">
                  <Brain className="h-4 w-4 text-brand-cyan" />
                  <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">Generated Study Plan</h3>
                </div>
                
                <div className="space-y-4">
                  {activeRoadmap.map((item, idx) => (
                    <div key={idx} className="border-l-2 border-brand-indigo pl-3 py-1 space-y-2 relative">
                      <div className="absolute -left-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-cyan"></div>
                      <h4 className="text-xs font-bold text-white">{item.timeframe}</h4>
                      
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-brand-silver">
                          <strong>Skills:</strong> {item.skillsToLearn.join(', ')}
                        </div>
                        {item.projectsToBuild.map((p: any, pIdx: number) => (
                          <div key={pIdx} className="bg-white/5 p-2 rounded border border-white/5 text-[9px]">
                            <div className="font-bold text-brand-cyan flex items-center justify-between">
                              <span>📁 {p.title}</span>
                              <span className="opacity-60">{p.techStack.slice(0,2).join(', ')}</span>
                            </div>
                            <p className="mt-1 text-brand-silver font-medium">{p.description}</p>
                          </div>
                        ))}
                        <div className="text-[10px] text-brand-silver font-medium">
                          <strong>Certifications:</strong> {item.certifications.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ) : (
              /* Presets */
              <div className="flex-1 flex flex-col justify-center gap-3">
                <span className="text-[10px] font-bold text-brand-silver uppercase tracking-wider">Quick Suggestions</span>
                {presetPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.text)}
                    className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:border-brand-indigo/40 hover:bg-white/10 transition text-xs font-bold text-white flex items-center justify-between group"
                  >
                    <span>{p.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-brand-silver group-hover:text-brand-cyan transition" />
                  </button>
                ))}
              </div>
            )}
            
          </div>

        </div>

      </div>
    </div>
  );
};
