// e:/AI Talent OS/src/pages/InterviewAssistant/InterviewAssistant.tsx
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { getGeminiClient } from '../../services/geminiService';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { Video, Award, RefreshCw, Send, CheckCircle2, ChevronRight } from 'lucide-react';

interface Question {
  question: string;
  type: 'technical' | 'behavioral' | 'hr';
  context: string;
}

export const InterviewAssistant: React.FC = () => {
  const { userProfile, updateUserProfile, apiSettings } = useStore();
  
  const [selectedRole, setSelectedRole] = useState('AI Engineer');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  
  // Feedback results
  const [answersSubmitted, setAnswersSubmitted] = useState<Record<number, {
    userText: string;
    feedback: string;
    techScore: number;
    confScore: number;
    commScore: number;
    suggested: string;
  }>>({});
  
  const [finished, setFinished] = useState(false);

  const roles = ['AI Engineer', 'ML Engineer', 'Data Scientist', 'Full Stack Developer'];

  const startInterview = async () => {
    setGenLoading(true);
    try {
      const gemini = getGeminiClient(apiSettings.geminiKey, apiSettings.isSimulator);
      const generated = await gemini.generateQuestions(selectedRole);
      setQuestions(generated);
      setInterviewStarted(true);
      setCurrentQuestionIdx(0);
      setUserAnswer('');
      setAnswersSubmitted({});
      setFinished(false);
    } catch (e) {
      console.error(e);
    } finally {
      setGenLoading(false);
    }
  };

  const handleNextOrFinish = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setUserAnswer(answersSubmitted[currentQuestionIdx + 1]?.userText || '');
    } else {
      // Calculate overall session aggregates
      const count = Object.keys(answersSubmitted).length;
      if (count > 0) {
        let avgTech = 0;
        let avgConf = 0;
        let avgComm = 0;
        
        Object.values(answersSubmitted).forEach(a => {
          avgTech += a.techScore;
          avgConf += a.confScore;
          avgComm += a.commScore;
        });

        const overallTech = Math.round(avgTech / count);
        const overallConf = Math.round(avgConf / count);
        const overallComm = Math.round(avgComm / count);

        updateUserProfile({
          technicalScore: overallTech,
          confidenceScore: overallConf,
          communicationScore: overallComm
        });
      }
      setFinished(true);
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    setLoading(true);

    try {
      const q = questions[currentQuestionIdx];
      const gemini = getGeminiClient(apiSettings.geminiKey, apiSettings.isSimulator);
      const evalResult = await gemini.evaluateAnswer(q.question, userAnswer);

      setAnswersSubmitted(prev => ({
        ...prev,
        [currentQuestionIdx]: {
          userText: userAnswer,
          feedback: evalResult.feedback,
          techScore: evalResult.technicalScore,
          confScore: evalResult.confidenceScore,
          commScore: evalResult.communicationScore,
          suggested: evalResult.suggestedAnswer
        }
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const activeQuestion = questions[currentQuestionIdx];
  const activeFeedback = answersSubmitted[currentQuestionIdx];

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo bottom-10 left-10 animate-pulse-slow"></div>
      <div className="glow-orb-cyan top-10 right-10 animate-pulse-slow"></div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">AI Interview Assistant</h1>
          <p className="text-brand-silver text-sm mt-1">
            Replicate technical and behavioral interviews with real-time feedback scores.
          </p>
        </div>

        {/* Start Interview Panel */}
        {!interviewStarted && (
          <GlassCard className="max-w-2xl mx-auto text-center space-y-6 py-12">
            <div className="p-4 rounded-full bg-brand-indigo/10 text-brand-cyan border border-brand-indigo/20 inline-block">
              <Video className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-display text-white">Configure Mock Interview</h2>
              <p className="text-brand-silver text-xs max-w-md mx-auto">
                Select your target career track below. The system will generate specific role-based queries.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                    selectedRole === role 
                      ? 'border-brand-cyan bg-brand-cyan/10 text-white' 
                      : 'border-white/10 text-brand-silver hover:bg-white/5'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <button
              onClick={startInterview}
              disabled={genLoading}
              className="px-6 py-3 rounded-xl bg-brand-indigo hover:bg-brand-indigo/80 disabled:opacity-50 text-white font-bold text-sm transition shadow-[0_0_15px_rgba(63,78,255,0.4)]"
            >
              {genLoading ? "Generating Session..." : "Initialize Session"}
            </button>
          </GlassCard>
        )}

        {/* Interview In Progress */}
        {interviewStarted && !finished && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Navigation timeline */}
            <GlassCard className="space-y-4 h-fit">
              <h3 className="font-display font-extrabold text-xs text-brand-silver uppercase tracking-wider">Session Timeline</h3>
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const hasAnswered = answersSubmitted[idx] !== undefined;
                  const isCurrent = currentQuestionIdx === idx;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setCurrentQuestionIdx(idx);
                        setUserAnswer(answersSubmitted[idx]?.userText || '');
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        isCurrent 
                          ? 'border-brand-cyan bg-brand-cyan/5 text-white'
                          : hasAnswered
                          ? 'border-brand-indigo/35 bg-white/5 text-brand-indigo'
                          : 'border-white/10 text-brand-silver hover:bg-white/5'
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent ? 'bg-brand-cyan text-black' : hasAnswered ? 'bg-brand-indigo text-white' : 'bg-white/10'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold capitalize">{q.type}</div>
                        <div className="text-[10px] text-brand-silver truncate">{q.context}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={() => setInterviewStarted(false)}
                className="w-full mt-4 py-2 border border-white/10 text-brand-silver hover:text-white rounded-lg text-xs font-semibold hover:bg-white/5 transition"
              >
                Quit Session
              </button>
            </GlassCard>

            {/* Answer workspace */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Question card */}
              <GlassCard className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
                  <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
                  <span className="px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/20">
                    {activeQuestion?.type}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  {activeQuestion?.question}
                </p>
              </GlassCard>

              {/* Text answer block */}
              {!activeFeedback ? (
                <GlassCard className="space-y-4">
                  <h4 className="text-xs font-bold text-brand-silver">Your Answer</h4>
                  <form onSubmit={submitAnswer} className="space-y-4">
                    <textarea
                      required
                      placeholder="Type your structured answer here (STAR approach recommended: Situation, Task, Action, Result)..."
                      rows={5}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl p-4 text-xs text-white outline-none focus:border-brand-cyan transition font-mono"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading || !userAnswer.trim()}
                        className="px-5 py-2.5 rounded-xl bg-brand-indigo hover:bg-brand-indigo/80 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Evaluating Response...
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            Submit Answer
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </GlassCard>
              ) : (
                /* Evaluated Feedback Card */
                <div className="space-y-6">
                  
                  {/* Scores row */}
                  <div className="grid grid-cols-3 gap-4">
                    <GlassCard className="p-4 text-center">
                      <div className="text-[10px] text-brand-silver font-bold uppercase">Technical</div>
                      <div className="text-2xl font-extrabold text-brand-cyan mt-1">{activeFeedback.techScore}%</div>
                    </GlassCard>
                    <GlassCard className="p-4 text-center">
                      <div className="text-[10px] text-brand-silver font-bold uppercase">Confidence</div>
                      <div className="text-2xl font-extrabold text-brand-indigo mt-1">{activeFeedback.confScore}%</div>
                    </GlassCard>
                    <GlassCard className="p-4 text-center">
                      <div className="text-[10px] text-brand-silver font-bold uppercase">Communication</div>
                      <div className="text-2xl font-extrabold text-pink-500 mt-1">{activeFeedback.commScore}%</div>
                    </GlassCard>
                  </div>

                  {/* Feedback description */}
                  <GlassCard className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                      <Award className="h-4 w-4 text-brand-cyan" />
                      <h4 className="text-xs font-bold text-white">AI Evaluation & Tips</h4>
                    </div>
                    <p className="text-xs text-brand-silver leading-relaxed font-mono">
                      {activeFeedback.feedback}
                    </p>
                  </GlassCard>

                  {/* Suggested model answer */}
                  <GlassCard className="space-y-3">
                    <h4 className="text-xs font-bold text-brand-cyan">Model Reference Answer</h4>
                    <p className="text-xs text-brand-silver leading-relaxed italic">
                      {activeFeedback.suggested}
                    </p>
                  </GlassCard>

                  {/* Navigation controls */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleNextOrFinish}
                      className="px-5 py-2.5 rounded-xl bg-brand-cyan text-black hover:bg-brand-cyan/80 font-bold text-xs transition flex items-center gap-1"
                    >
                      {currentQuestionIdx === questions.length - 1 ? "Complete Session" : "Next Question"}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* Session Completed Overview */}
        {finished && (
          <GlassCard className="max-w-xl mx-auto text-center space-y-6 py-10">
            <div className="p-4 rounded-full bg-brand-success/10 text-brand-success border border-brand-success/20 inline-block">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display text-white">Interview Practice Completed!</h2>
              <p className="text-brand-silver text-xs max-w-sm mx-auto">
                Excellent work completing the {selectedRole} questions. Performance grades updated in dashboard.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto border-y border-brand-border py-4">
              <div>
                <div className="text-[10px] text-brand-silver">Avg Technical</div>
                <div className="text-xl font-bold text-white mt-1">{userProfile.technicalScore}%</div>
              </div>
              <div>
                <div className="text-[10px] text-brand-silver">Avg Confidence</div>
                <div className="text-xl font-bold text-white mt-1">{userProfile.confidenceScore}%</div>
              </div>
              <div>
                <div className="text-[10px] text-brand-silver">Avg Comm</div>
                <div className="text-xl font-bold text-white mt-1">{userProfile.communicationScore}%</div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setInterviewStarted(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-bold text-xs hover:bg-white/5 transition"
              >
                Return Configuration
              </button>
              <button
                onClick={startInterview}
                className="px-5 py-2.5 rounded-xl bg-brand-indigo text-white font-bold text-xs hover:bg-brand-indigo/80 transition shadow-[0_0_15px_rgba(63,78,255,0.3)]"
              >
                Restart Session
              </button>
            </div>
          </GlassCard>
        )}

      </div>
    </div>
  );
};
