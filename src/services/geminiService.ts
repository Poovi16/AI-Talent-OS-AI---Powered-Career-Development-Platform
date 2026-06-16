// e:/AI Talent OS/src/services/geminiService.ts

import type { ParsedResume } from '../store/useStore';

interface GeminiAnalysisResult {
  score: number;
  atsScore: number;
  skills: string[];
  experienceAnalysis: string;
  projectAnalysis: string;
  missingSkills: string[];
  suggestions: string[];
}

interface GeminiJobMatchResult {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  suitabilityRating: 'High' | 'Medium' | 'Low';
  suitabilityDetails: string;
}

interface GeminiInterviewQuestion {
  question: string;
  type: 'technical' | 'behavioral' | 'hr';
  context: string;
}

interface GeminiInterviewFeedback {
  feedback: string;
  technicalScore: number;
  confidenceScore: number;
  communicationScore: number;
  suggestedAnswer: string;
}

interface GeminiRoadmapItem {
  timeframe: string;
  skillsToLearn: string[];
  projectsToBuild: { title: string; description: string; techStack: string[] }[];
  certifications: string[];
  interviewPrep: string;
}

interface GeminiCareerCoachResponse {
  answer: string;
  roadmap?: GeminiRoadmapItem[];
}

export interface CareerInsight {
  inDemandSkills: { skill: string; demandLevel: 'High' | 'Medium' | 'Low'; growthTrend: string }[];
  salaryRange: { low: string; mid: string; high: string; currency: string };
  hiringTrends: string[];
  recommendations: string[];
}

export const getGeminiClient = (apiKey: string, isSimulator: boolean) => {
  const isSim = isSimulator || !apiKey;

  const runGemini = async (prompt: string, expectJson = true): Promise<string> => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: expectJson ? { responseMimeType: 'application/json' } : undefined,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to contact Gemini API');
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (e) {
      console.error('Gemini API Error, falling back to simulator', e);
      throw e;
    }
  };

  return {
    // 1. Analyze Resume
    analyzeResume: async (fileName: string, fileContentText: string): Promise<GeminiAnalysisResult> => {
      if (isSim) {
        // High fidelity mock
        await new Promise((r) => setTimeout(r, 2000));
        
        // Dynamic analysis based on filename or dummy content
        const lowerName = fileName.toLowerCase();
        let score = 78;
        let ats = 74;
        let skills = ['Python', 'SQL', 'TypeScript', 'React', 'Node.js', 'Git'];
        let missing = ['AWS', 'Docker', 'Kubernetes', 'PyTorch'];
        let suggestions = [
          'Add quantitative metrics to experience descriptions (e.g., "improved loading time by 20%")',
          'Include cloud deployments in your project section',
          'Highlight experience with vector databases or ML APIs'
        ];

        if (lowerName.includes('ml') || lowerName.includes('ai') || lowerName.includes('data')) {
          score = 88;
          ats = 85;
          skills = ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Pandas', 'Scikit-Learn', 'Git'];
          missing = ['CUDA', 'LangChain', 'FastAPI', 'MLflow'];
          suggestions = [
            'Mention distributed model training configurations',
            'Detail the deployment environment (e.g., FastAPI in Docker container)',
            'Add hyperparameter tuning experience metrics'
          ];
        }

        return {
          score,
          atsScore: ats,
          skills,
          experienceAnalysis: 'Demonstrates strong engineering foundations and codebase management. Project complexity is adequate, but could showcase more design ownership.',
          projectAnalysis: 'Projects focus heavily on local development. Recommending hosting applications on cloud infrastructures.',
          missingSkills: missing,
          suggestions
        };
      }

      const prompt = `
        You are an AI Resume Analyzer. You will analyze the resume content below (filename: "${fileName}").
        Provide a structured evaluation in JSON matching this interface:
        {
          "score": number (0-100),
          "atsScore": number (0-100),
          "skills": string[],
          "experienceAnalysis": string,
          "projectAnalysis": string,
          "missingSkills": string[],
          "suggestions": string[]
        }
        
        Resume text:
        ${fileContentText || "Default engineer profile. Knows JavaScript, Python, and databases."}
      `;

      const responseText = await runGemini(prompt);
      return JSON.parse(responseText);
    },

    // 2. Extract Resume Data (structured parsing)
    extractResumeData: async (fileContentText: string): Promise<ParsedResume> => {
      if (isSim) {
        await new Promise((r) => setTimeout(r, 1800));
        return {
          skills: ['Python', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS'],
          experience: [
            { title: 'Software Engineer II', company: 'TechCorp Inc.', duration: '2023 – Present' },
            { title: 'Junior Developer', company: 'StartupLab', duration: '2021 – 2023' },
          ],
          education: [
            { degree: 'B.S. Computer Science', institution: 'UC Berkeley', year: '2021' },
          ],
          certifications: ['AWS Cloud Practitioner', 'Google TensorFlow Developer Certificate'],
          projects: [
            {
              title: 'AI-Powered Code Review Bot',
              description: 'Built an automated code review tool leveraging LLM APIs to provide intelligent suggestions on pull requests.',
              techStack: ['Python', 'FastAPI', 'OpenAI API', 'Docker'],
            },
            {
              title: 'Real-Time Analytics Dashboard',
              description: 'Designed a React + D3.js dashboard visualizing live metrics from distributed microservices.',
              techStack: ['React', 'TypeScript', 'D3.js', 'WebSocket'],
            },
          ],
          summary: 'Full-stack software engineer with 4+ years of experience building scalable web applications and AI-powered tools. Proficient in Python, TypeScript, and cloud infrastructure.',
        };
      }

      const prompt = `
        You are an AI Resume Parser. Extract structured data from the resume text below.
        Provide a JSON response matching this interface:
        {
          "skills": string[],
          "experience": [{ "title": string, "company": string, "duration": string }],
          "education": [{ "degree": string, "institution": string, "year": string }],
          "certifications": string[],
          "projects": [{ "title": string, "description": string, "techStack": string[] }],
          "summary": string
        }
        
        Resume text:
        ${fileContentText}
      `;
      const responseText = await runGemini(prompt);
      return JSON.parse(responseText);
    },

    // 3. Job Matching
    matchJob: async (userSkills: string[], jobDescription: string): Promise<GeminiJobMatchResult> => {
      if (isSim) {
        await new Promise((r) => setTimeout(r, 1500));
        const matched = userSkills.filter(s => jobDescription.toLowerCase().includes(s.toLowerCase()));
        
        // Simple mock matching algorithm
        const totalJobKeywords = 10; 
        const matchRatio = Math.min((matched.length + 2) / totalJobKeywords, 1);
        const matchPercentage = Math.round(matchRatio * 100);
        
        const suitabilityRating = matchPercentage > 85 ? 'High' : matchPercentage > 60 ? 'Medium' : 'Low';
        const missing = ['Kubernetes', 'AWS Solutions Architect', 'LangChain'].filter(
          s => !userSkills.map(us => us.toLowerCase()).includes(s.toLowerCase())
        );

        return {
          matchPercentage,
          matchingSkills: matched,
          missingSkills: missing,
          suitabilityRating,
          suitabilityDetails: `Matched ${matched.length} key skills. To improve fit, highlight hands-on experience in ${missing.join(', ')}.`
        };
      }

      const prompt = `
        You are an AI Job Matcher. Match candidate skills against the job description.
        Candidate skills: ${JSON.stringify(userSkills)}
        
        Job Description:
        ${jobDescription}
        
        Provide a structured response in JSON matching this interface:
        {
          "matchPercentage": number (0-100),
          "matchingSkills": string[],
          "missingSkills": string[],
          "suitabilityRating": "High" | "Medium" | "Low",
          "suitabilityDetails": string
        }
      `;
      const responseText = await runGemini(prompt);
      return JSON.parse(responseText);
    },

    // 4. Career Insights
    getCareerInsights: async (targetRole: string, userSkills: string[]): Promise<CareerInsight> => {
      if (isSim) {
        await new Promise((r) => setTimeout(r, 2000));

        const insightsMap: Record<string, CareerInsight> = {
          'AI Engineer': {
            inDemandSkills: [
              { skill: 'PyTorch / JAX', demandLevel: 'High', growthTrend: '+42% YoY' },
              { skill: 'LangChain / LlamaIndex', demandLevel: 'High', growthTrend: '+85% YoY' },
              { skill: 'Kubernetes', demandLevel: 'Medium', growthTrend: '+18% YoY' },
              { skill: 'Rust (for ML infra)', demandLevel: 'Medium', growthTrend: '+30% YoY' },
              { skill: 'Vector Databases', demandLevel: 'High', growthTrend: '+120% YoY' },
            ],
            salaryRange: { low: '$145,000', mid: '$195,000', high: '$310,000', currency: 'USD' },
            hiringTrends: [
              'Companies are prioritizing candidates with production LLM deployment experience.',
              'RAG (Retrieval-Augmented Generation) expertise has become a top-3 requirement.',
              'Remote AI roles have increased 35% since 2025, with Bay Area compensation leading.',
              'Startups are offering 15-25% equity premiums for senior AI engineering hires.',
            ],
            recommendations: [
              'Build a portfolio project demonstrating end-to-end RAG pipeline deployment.',
              'Obtain AWS ML Specialty or GCP Professional ML Engineer certification.',
              'Contribute to open-source LLM frameworks (vLLM, LangChain, Transformers).',
              'Practice system design interviews focused on ML serving architectures.',
            ],
          },
        };

        return insightsMap[targetRole] || insightsMap['AI Engineer'];
      }

      const prompt = `
        You are an AI Career Market Analyst. Provide current market insights for the role: "${targetRole}".
        The candidate currently has these skills: ${JSON.stringify(userSkills)}.
        
        Provide a structured response in JSON matching this interface:
        {
          "inDemandSkills": [{ "skill": string, "demandLevel": "High" | "Medium" | "Low", "growthTrend": string }],
          "salaryRange": { "low": string, "mid": string, "high": string, "currency": string },
          "hiringTrends": string[],
          "recommendations": string[]
        }
      `;
      const responseText = await runGemini(prompt);
      return JSON.parse(responseText);
    },

    // 5. Interview Assistant Questions
    generateQuestions: async (role: string): Promise<GeminiInterviewQuestion[]> => {
      if (isSim) {
        await new Promise((r) => setTimeout(r, 1000));
        
        const qaMap: Record<string, GeminiInterviewQuestion[]> = {
          'AI Engineer': [
            { question: 'What is the difference between fine-tuning and retrieval-augmented generation (RAG)? When would you choose one over the other?', type: 'technical', context: 'LLM Architectures' },
            { question: 'Describe a time when you had to optimize an expensive model query. What parameters did you adjust?', type: 'behavioral', context: 'Performance Tuning' },
            { question: 'Why are you interested in AI Engineering specifically, and how do you stay up-to-date with daily research?', type: 'hr', context: 'Motivation' }
          ],
          'ML Engineer': [
            { question: 'Explain the difference between data parallelism and model parallelism when training large models.', type: 'technical', context: 'Distributed Training' },
            { question: 'How do you handle feature store updates to prevent training-serving skew in real-time pipelines?', type: 'behavioral', context: 'Data Drift' },
            { question: 'How do you handle disagreements on model performance evaluation criteria with business stakeholders?', type: 'hr', context: 'Conflict Resolution' }
          ],
          'Data Scientist': [
            { question: 'How does the XGBoost algorithm handle missing values internally?', type: 'technical', context: 'Tree-based Models' },
            { question: 'Tell me about a time you designed an A/B test and the results were inconclusive. What did you recommend?', type: 'behavioral', context: 'Experimentation' },
            { question: 'How do you translate complex statistical scores into clear business outcomes for non-technical execs?', type: 'hr', context: 'Communication' }
          ],
          'Full Stack Developer': [
            { question: 'How do you design a secure web server that handles SSE (Server-Sent Events) for real-time AI responses?', type: 'technical', context: 'API Architectures' },
            { question: 'Describe a complex frontend state issue you resolved using global state management.', type: 'behavioral', context: 'Debugging' },
            { question: 'What is your strategy for prioritizing feature updates when timeline pressure is high?', type: 'hr', context: 'Planning' }
          ]
        };

        return qaMap[role] || qaMap['AI Engineer'];
      }

      const prompt = `
        You are an Interview Assistant. Generate exactly 3 interview questions (1 technical, 1 behavioral, 1 hr) for the role: "${role}".
        Provide a structured response in JSON matching this interface:
        [
          {
            "question": string,
            "type": "technical" | "behavioral" | "hr",
            "context": string
          }
        ]
      `;
      const responseText = await runGemini(prompt);
      return JSON.parse(responseText);
    },

    // 6. Mock Interview Answer Feedback
    evaluateAnswer: async (question: string, userAnswer: string): Promise<GeminiInterviewFeedback> => {
      if (isSim) {
        await new Promise((r) => setTimeout(r, 2000));
        
        const len = userAnswer.trim().length;
        let scoreVal = 50;
        let feedback = "Your answer is a bit brief. Try to structure it using the STAR method (Situation, Task, Action, Result) and add specific tech terminology.";
        let modelAns = "A great answer should outline the core concepts clearly, provide a concrete example from your past work, and explain the positive outcome.";

        if (len > 150) {
          scoreVal = 85;
          feedback = "Excellent response. You provided details on implementation, addressed the trade-offs, and showed good technical awareness.";
          modelAns = "Your answer already covers the primary concepts: you mentioned system constraints, specific libraries used, and how you evaluated performance metrics. To polish, add a brief mention of production monitoring.";
        } else if (len > 50) {
          scoreVal = 70;
          feedback = "Good foundation. However, you should expand more on the 'Result' of your actions or explain the internal mechanics of the tool you used.";
        }

        return {
          feedback,
          technicalScore: scoreVal,
          confidenceScore: scoreVal + 5,
          communicationScore: scoreVal - 2,
          suggestedAnswer: modelAns
        };
      }

      const prompt = `
        Evaluate this interview answer:
        Question: ${question}
        User Answer: ${userAnswer}
        
        Provide structured feedback in JSON matching this interface:
        {
          "feedback": string,
          "technicalScore": number (0-100),
          "confidenceScore": number (0-100),
          "communicationScore": number (0-100),
          "suggestedAnswer": string
        }
      `;
      const responseText = await runGemini(prompt);
      return JSON.parse(responseText);
    },

    // 7. Career Coach Chat
    chatCareerCoach: async (messages: { sender: string; text: string }[], currentSkills: string[], targetRole: string): Promise<GeminiCareerCoachResponse> => {
      if (isSim) {
        await new Promise((r) => setTimeout(r, 2000));
        const lastMsg = messages[messages.length - 1]?.text.toLowerCase() || '';

        let answer = "That is a very interesting query! As an AI coach, I recommend focusing on building hands-on portfolio projects. This proves to hiring managers that you can deploy models and build end-to-end applications, not just run notebooks.";
        let roadmap: GeminiRoadmapItem[] | undefined;

        if (lastMsg.includes('roadmap') || lastMsg.includes('plan') || lastMsg.includes('month')) {
          answer = "I have generated a customized career transition plan based on your target role of " + targetRole + ". See the detailed timeline breakdown below.";
          
          roadmap = [
            {
              timeframe: 'Month 1-3: Foundations & Core Skill Upgrades',
              skillsToLearn: ['TensorFlow/PyTorch basics', 'API construction with FastAPI', 'Python core algorithms'],
              projectsToBuild: [
                {
                  title: 'Text Summarization Service',
                  description: 'Build an API service wrapping HuggingFace models, dockerized and deployed locally.',
                  techStack: ['Python', 'FastAPI', 'Docker', 'Transformers']
                }
              ],
              certifications: ['DeepLearning.AI TensorFlow Developer Certificate'],
              interviewPrep: 'Practice linear algebra, probability, and basic data structures on LeetCode.'
            },
            {
              timeframe: 'Month 4-6: Advanced Architectures & Systems Design',
              skillsToLearn: ['Vector databases', 'Retrieval-Augmented Generation (RAG)', 'LangChain / LlamaIndex'],
              projectsToBuild: [
                {
                  title: 'Semantic Document Search Engine',
                  description: 'A React and Python-based multi-document search engine utilizing Pinecone database.',
                  techStack: ['React', 'Python', 'Pinecone', 'OpenAI API']
                }
              ],
              certifications: ['AWS Certified Machine Learning - Specialty'],
              interviewPrep: 'Study machine learning systems design architectures, data pipeline caching, and trade-offs.'
            }
          ];
        } else if (lastMsg.includes('project') || lastMsg.includes('portfolio')) {
          answer = "Here are a few high-impact portfolio projects that will set you apart for " + targetRole + " roles:\n\n1. **Model Deployment Pipeline**: Train a custom model, package it with FastAPI, build a React dashboard, containerize with Docker, and host on AWS.\n2. **Dynamic RAG Chatbot**: Create a conversational AI that indexes private documents and answers queries with citations.\n3. **MLOps Monitoring Dashboard**: Set up an active inference system with dashboard graphs monitoring latency, input data drift, and accuracy drop.";
        } else if (lastMsg.includes('cert') || lastMsg.includes('workshop')) {
          answer = "For " + targetRole + " roles, the most valuable industry credentials are:\n\n- **AWS Certified Machine Learning Specialty**: Proof of AWS deployment and architecture capacity.\n- **DeepLearning.AI TensorFlow / PyTorch Specializations**: Validates deep learning foundations.\n- **Google Cloud Professional ML Engineer**: Showcases expertise in Vertex AI and big data tools.";
        }

        return { answer, roadmap };
      }

      const prompt = `
        You are an AI Career Coach.
        Candidate current skills: ${JSON.stringify(currentSkills)}
        Candidate target role: ${targetRole}
        
        Conversation history:
        ${JSON.stringify(messages)}
        
        Provide a helpful response. If the user asks for a roadmap, plan, study guide, or projects, you should return a structured JSON response matching this interface:
        {
          "answer": string (general conversational text),
          "roadmap": [
            {
              "timeframe": string,
              "skillsToLearn": string[],
              "projectsToBuild": [
                { "title": string, "description": string, "techStack": string[] }
              ],
              "certifications": string[],
              "interviewPrep": string
            }
          ]
        }
        
        If it's just normal chat, return:
        {
          "answer": string
        }
      `;
      const responseText = await runGemini(prompt);
      return JSON.parse(responseText);
    }
  };
};
