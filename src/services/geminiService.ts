// e:/AI Talent OS/src/services/geminiService.ts

import type { ParsedResume, DeepResumeAnalysis } from '../store/useStore';

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

    // 1b. Deep Analyze Resume (comprehensive 12-phase analysis)
    deepAnalyzeResume: async (fileContentText: string, targetRole: string): Promise<DeepResumeAnalysis> => {
      if (isSim) {
        await new Promise((r) => setTimeout(r, 3000));

        // Content-aware analysis based on actual text
        const lower = fileContentText.toLowerCase();
        const hasAI = lower.includes('machine learning') || lower.includes('deep learning') || lower.includes('tensorflow') || lower.includes('pytorch');
        const hasCloud = lower.includes('aws') || lower.includes('azure') || lower.includes('gcp') || lower.includes('cloud');
        const hasDocker = lower.includes('docker') || lower.includes('kubernetes') || lower.includes('containeriz');
        const hasGithub = lower.includes('github.com') || lower.includes('github:');
        const hasLinkedin = lower.includes('linkedin.com');
        const hasProjects = lower.includes('project');
        const hasCerts = lower.includes('certif') || lower.includes('credential');
        const hasLeadership = lower.includes('led') || lower.includes('managed') || lower.includes('leadership');
        const hasMetrics = /\d+%/.test(lower) || lower.includes('improved') || lower.includes('reduced');

        // Detect skills from text
        const skillScan = (words: string[]) => words.filter(w => lower.includes(w.toLowerCase()));
        const progLangs = skillScan(['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'Go', 'Rust', 'C#', 'Ruby', 'Kotlin', 'Swift', 'Scala', 'R']);
        const aiSkills = skillScan(['TensorFlow', 'PyTorch', 'Scikit-Learn', 'Keras', 'CUDA', 'Hugging Face', 'LangChain', 'OpenAI', 'ONNX', 'MLflow', 'NLP', 'Computer Vision']);
        const cloudSkills = skillScan(['AWS', 'Azure', 'GCP', 'Lambda', 'S3', 'EC2', 'Vertex AI', 'SageMaker', 'CloudFormation']);
        const dbSkills = skillScan(['SQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'DynamoDB', 'Elasticsearch', 'Neo4j', 'Pinecone']);
        const toolSkills = skillScan(['Git', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Ansible', 'CI/CD', 'GitHub Actions', 'Linux', 'Grafana']);
        const fwSkills = skillScan(['React', 'Node.js', 'Next.js', 'FastAPI', 'Django', 'Flask', 'Express', 'Spring Boot', 'Vue.js', 'Angular']);
        const softSkills = skillScan(['Leadership', 'Communication', 'Teamwork', 'Problem-Solving', 'Agile', 'Scrum', 'Mentoring']);

        const allDetected = [...progLangs, ...aiSkills, ...cloudSkills, ...dbSkills, ...toolSkills, ...fwSkills];
        const overallScore = Math.min(95, 55 + (allDetected.length * 2) + (hasMetrics ? 8 : 0) + (hasProjects ? 5 : 0) + (hasCerts ? 5 : 0));
        const atsScore = Math.min(92, 50 + (hasLinkedin ? 6 : 0) + (hasGithub ? 6 : 0) + (allDetected.length * 1.5) + (hasMetrics ? 10 : 0));
        const technicalStrength = Math.min(95, 45 + (progLangs.length * 5) + (aiSkills.length * 4) + (fwSkills.length * 3));
        const projectQuality = Math.min(90, 40 + (hasProjects ? 20 : 0) + (hasMetrics ? 15 : 0) + (hasAI ? 10 : 0));
        const recruiterReadiness = Math.min(88, 50 + (hasLinkedin ? 8 : 0) + (hasGithub ? 8 : 0) + (hasCerts ? 7 : 0) + (hasLeadership ? 7 : 0));

        // ATS keyword density
        const topKeywords = ['Python', 'JavaScript', 'React', 'AWS', 'Docker', 'SQL', 'Machine Learning', 'API', 'Git', 'Node.js'];
        const keywordDensity = topKeywords.map(kw => {
          const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          const count = (fileContentText.match(regex) || []).length;
          return {
            keyword: kw,
            count,
            status: (count >= 3 ? 'good' : count >= 1 ? 'low' : 'missing') as 'good' | 'low' | 'missing',
          };
        });

        // Missing keywords based on target role
        const roleMissingMap: Record<string, string[]> = {
          'AI Engineer': ['MLOps', 'Model Serving', 'Vector Database', 'RAG Pipeline', 'Fine-Tuning'].filter(s => !lower.includes(s.toLowerCase())),
          'Machine Learning Engineer': ['Feature Store', 'A/B Testing', 'Data Pipeline', 'Model Monitoring', 'Distributed Training'].filter(s => !lower.includes(s.toLowerCase())),
          'Data Scientist': ['Statistical Analysis', 'A/B Testing', 'Jupyter', 'Tableau', 'Hypothesis Testing'].filter(s => !lower.includes(s.toLowerCase())),
          'Full Stack Developer': ['REST API', 'GraphQL', 'Authentication', 'CI/CD', 'Testing'].filter(s => !lower.includes(s.toLowerCase())),
          'Frontend Developer': ['Responsive Design', 'Accessibility', 'Web Performance', 'CSS Architecture', 'State Management'].filter(s => !lower.includes(s.toLowerCase())),
          'Backend Developer': ['Microservices', 'Message Queue', 'Caching', 'Load Balancing', 'API Design'].filter(s => !lower.includes(s.toLowerCase())),
          'DevOps Engineer': ['Infrastructure as Code', 'Monitoring', 'Incident Response', 'SLA Management', 'Container Orchestration'].filter(s => !lower.includes(s.toLowerCase())),
          'Cyber Security Analyst': ['Penetration Testing', 'SIEM', 'Vulnerability Assessment', 'Compliance', 'Incident Response'].filter(s => !lower.includes(s.toLowerCase())),
          'UI UX Designer': ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'].filter(s => !lower.includes(s.toLowerCase())),
          'Product Manager': ['Roadmapping', 'User Stories', 'Stakeholder Management', 'Metrics', 'Sprint Planning'].filter(s => !lower.includes(s.toLowerCase())),
        };
        const missingKeywords = roleMissingMap[targetRole] || roleMissingMap['AI Engineer'];

        const sectionAnalysis: { section: string; found: boolean; quality: 'strong' | 'adequate' | 'weak' | 'missing' }[] = [
          { section: 'Contact Information', found: lower.includes('email') || lower.includes('@'), quality: (lower.includes('email') || lower.includes('@')) ? 'strong' : 'missing' },
          { section: 'Professional Summary', found: lower.includes('summary') || lower.includes('objective') || lower.includes('about'), quality: lower.includes('summary') ? 'strong' : lower.includes('objective') ? 'adequate' : 'missing' },
          { section: 'Work Experience', found: lower.includes('experience') || lower.includes('work'), quality: hasMetrics ? 'strong' : lower.includes('experience') ? 'adequate' : 'missing' },
          { section: 'Education', found: lower.includes('education') || lower.includes('university') || lower.includes('degree'), quality: lower.includes('degree') ? 'strong' : lower.includes('education') ? 'adequate' : 'missing' },
          { section: 'Skills', found: lower.includes('skill'), quality: allDetected.length > 8 ? 'strong' : allDetected.length > 4 ? 'adequate' : 'weak' },
          { section: 'Projects', found: hasProjects, quality: hasProjects && hasMetrics ? 'strong' : hasProjects ? 'adequate' : 'missing' },
          { section: 'Certifications', found: hasCerts, quality: hasCerts ? 'adequate' : 'missing' },
        ];

        const formattingIssues: string[] = [];
        if (!hasLinkedin) formattingIssues.push('No LinkedIn profile URL detected');
        if (!hasGithub) formattingIssues.push('No GitHub profile URL detected');
        if (!hasMetrics) formattingIssues.push('No quantifiable achievements found (e.g., "improved by 30%")');
        if (!hasCerts) formattingIssues.push('No certifications section found');
        if (fileContentText.length < 500) formattingIssues.push('Resume content appears too brief — aim for 1-2 pages');
        if (!lower.includes('phone') && !lower.includes('+1') && !lower.includes('+91')) formattingIssues.push('No phone number detected');

        const strengths: string[] = [];
        const weaknesses: string[] = [];
        if (progLangs.length >= 3) strengths.push('Strong multi-language programming foundation');
        if (hasAI) strengths.push('Demonstrated AI/ML expertise with relevant frameworks');
        if (hasCloud) strengths.push('Cloud deployment experience present');
        if (hasMetrics) strengths.push('Quantifiable achievements strengthen impact claims');
        if (hasProjects) strengths.push('Portfolio of projects demonstrates practical application');
        if (hasLeadership) strengths.push('Leadership and team management experience');
        if (hasCerts) strengths.push('Industry certifications validate technical skills');
        if (strengths.length === 0) strengths.push('Resume submitted for analysis — strong initiative');

        if (!hasCloud) weaknesses.push('No cloud platform experience mentioned');
        if (!hasDocker) weaknesses.push('Missing containerization / DevOps experience');
        if (!hasCerts) weaknesses.push('No industry certifications listed');
        if (!hasMetrics) weaknesses.push('Bullet points lack quantifiable impact metrics');
        if (!hasLeadership) weaknesses.push('No leadership or mentoring experience highlighted');
        if (!hasGithub) weaknesses.push('No GitHub/portfolio link for code review');
        if (progLangs.length < 2) weaknesses.push('Limited programming language diversity');

        const improvements: DeepResumeAnalysis['improvements'] = [
          {
            category: 'bullet_points',
            before: 'Built a machine learning model for predictions',
            after: 'Engineered a gradient-boosted ML model achieving 94% accuracy on 50K+ samples, reducing prediction latency by 40% through optimized feature engineering',
            reason: 'Add specificity: model type, dataset size, accuracy, and performance impact',
          },
          {
            category: 'summary',
            before: 'Software engineer with experience in web development',
            after: 'Full-stack engineer with 4+ years building scalable applications serving 100K+ users, specializing in React/TypeScript frontends and Python microservices deployed on AWS',
            reason: 'Include years of experience, scale, tech stack, and deployment context',
          },
          {
            category: 'projects',
            before: 'Created a chatbot using AI',
            after: 'Developed a RAG-powered conversational assistant using LangChain + Pinecone, processing 10K+ documents with sub-second retrieval latency and 92% user satisfaction score',
            reason: 'Specify the architecture, scale, and measurable outcome',
          },
          {
            category: 'achievements',
            before: 'Improved team efficiency',
            after: 'Implemented CI/CD pipeline with GitHub Actions, reducing deployment time from 45 min to 8 min and cutting production incidents by 60%',
            reason: 'Quantify the before/after impact with specific numbers',
          },
        ];

        const matchPct = Math.min(92, 50 + (allDetected.length * 2) + (hasAI ? 8 : 0) + (hasCloud ? 5 : 0) + (hasCerts ? 5 : 0));
        const roleMatch: DeepResumeAnalysis['roleMatch'] = {
          matchPercentage: matchPct,
          missingSkills: missingKeywords.slice(0, 5),
          recommendedSkills: missingKeywords.slice(0, 3),
          hiringReadiness: matchPct >= 85 ? 'Ready' : matchPct >= 70 ? 'Almost Ready' : matchPct >= 55 ? 'Needs Work' : 'Significant Gaps',
        };

        const portfolioEvaluation: DeepResumeAnalysis['portfolioEvaluation'] = hasProjects ? [
          {
            project: 'AI-Powered Application',
            innovationScore: hasAI ? 82 : 60,
            technicalDepth: hasAI ? 78 : 55,
            industryRelevance: 85,
            recruiterAppeal: hasMetrics ? 80 : 62,
            recommendation: hasMetrics
              ? 'Strong project. Add a live demo link and architecture diagram for maximum recruiter impact.'
              : 'Add quantifiable outcomes (latency, accuracy, user count) to demonstrate real-world impact.',
          },
          {
            project: 'Full-Stack Web Application',
            innovationScore: 65,
            technicalDepth: fwSkills.length >= 2 ? 75 : 55,
            industryRelevance: 78,
            recruiterAppeal: 70,
            recommendation: 'Showcase responsive design, authentication flows, and deployment pipeline to elevate this project.',
          },
        ] : [{
          project: 'No projects detected',
          innovationScore: 0, technicalDepth: 0, industryRelevance: 0, recruiterAppeal: 0,
          recommendation: 'Adding 2-3 portfolio projects with live demos would significantly boost your resume strength.',
        }];

        const shortlistProb = Math.min(90, recruiterReadiness + (hasMetrics ? 5 : -5));
        const recruiterView: DeepResumeAnalysis['recruiterView'] = {
          shortlistProbability: shortlistProb,
          interviewProbability: Math.max(30, shortlistProb - 10),
          strengthAreas: strengths.slice(0, 4),
          riskAreas: weaknesses.slice(0, 3),
          overallVerdict: shortlistProb >= 75
            ? 'Strong candidate — likely to pass initial ATS screening and receive recruiter attention.'
            : shortlistProb >= 55
              ? 'Moderate candidate — needs targeted improvements to consistently clear ATS filters.'
              : 'Needs significant work — resume may not pass automated screening systems.',
        };

        const learningPath: DeepResumeAnalysis['learningPath'] = missingKeywords.slice(0, 4).map(skill => ({
          skill,
          courses: [`${skill} Fundamentals – Coursera`, `Advanced ${skill} – Udemy`, `${skill} Hands-On Workshop – LinkedIn Learning`],
          certifications: [`${skill} Professional Certificate`, `Google Cloud ${skill} Specialization`],
          projects: [`Build a ${skill.toLowerCase()} demo project`, `Contribute to open-source ${skill.toLowerCase()} tools`],
        }));

        const rewriteSuggestions: DeepResumeAnalysis['rewriteSuggestions'] = {
          summaryRewrite: `Results-driven ${targetRole} with expertise in ${progLangs.slice(0, 3).join(', ') || 'Python, JavaScript, TypeScript'} and hands-on experience delivering production-grade ${hasAI ? 'AI/ML solutions' : 'software systems'}. Proven track record of ${hasMetrics ? 'measurable impact' : 'building scalable applications'} across ${hasCloud ? 'cloud-native' : 'modern'} tech stacks.`,
          experienceRewrites: [
            { original: 'Worked on backend services', rewritten: 'Architected and deployed 5+ RESTful microservices handling 10K+ daily requests with 99.9% uptime on AWS ECS' },
            { original: 'Helped with team projects', rewritten: 'Collaborated with a cross-functional team of 8 engineers to deliver a product feature adopted by 25K+ users within 3 months of launch' },
          ],
          achievementStatements: [
            `Reduced ${hasAI ? 'model inference latency' : 'API response time'} by 45% through ${hasAI ? 'ONNX quantization and batched inference' : 'query optimization and Redis caching'}`,
            'Automated deployment pipeline reducing release cycle from 2 weeks to 2 days with zero-downtime deployments',
            `Mentored ${hasLeadership ? '3' : '2'} junior developers, accelerating their onboarding from 4 weeks to 10 days`,
          ],
        };

        const parsedData: ParsedResume = {
          skills: [...progLangs, ...aiSkills, ...cloudSkills, ...dbSkills, ...toolSkills, ...fwSkills],
          experience: [
            { title: 'Software Engineer', company: 'Detected from resume', duration: '2+ years' },
          ],
          education: [
            { degree: 'B.S. / M.S. Computer Science', institution: 'Detected from resume', year: '2020-2024' },
          ],
          certifications: hasCerts ? ['Industry Certification Detected'] : [],
          projects: hasProjects ? [
            { title: 'Portfolio Project', description: 'Detected from resume content', techStack: progLangs.slice(0, 3) },
          ] : [],
          summary: `${targetRole} candidate with ${allDetected.length}+ technical skills detected across programming, frameworks, and tools.`,
        };

        return {
          overallScore: Math.round(overallScore),
          atsScore: Math.round(atsScore),
          technicalStrengthScore: Math.round(technicalStrength),
          projectQualityScore: Math.round(projectQuality),
          recruiterReadinessScore: Math.round(recruiterReadiness),
          atsReport: { keywordDensity, missingKeywords, sectionAnalysis, formattingIssues },
          extractedSkills: {
            programmingLanguages: progLangs.length > 0 ? progLangs : ['Python', 'JavaScript'],
            aiMl: aiSkills.length > 0 ? aiSkills : [],
            cloud: cloudSkills.length > 0 ? cloudSkills : [],
            databases: dbSkills.length > 0 ? dbSkills : ['SQL'],
            tools: toolSkills.length > 0 ? toolSkills : ['Git'],
            frameworks: fwSkills.length > 0 ? fwSkills : [],
            softSkills: softSkills.length > 0 ? softSkills : ['Problem-Solving', 'Communication'],
          },
          strengths, weaknesses, improvements, roleMatch, portfolioEvaluation, recruiterView, learningPath, rewriteSuggestions,
          parsedData, experienceAnalysis: 'Content-based analysis completed.', projectAnalysis: 'Project evaluation completed.',
        };
      }

      // ── Live Gemini API call ─────────────────────────────────────
      const prompt = `You are an elite AI Resume Intelligence Platform. Perform a comprehensive 12-phase analysis of this resume for the target role: "${targetRole}".

Resume text:
${fileContentText}

Return a single JSON object with this EXACT structure (no markdown, no extra text):
{
  "overallScore": number (0-100, realistic assessment),
  "atsScore": number (0-100, ATS compatibility),
  "technicalStrengthScore": number (0-100),
  "projectQualityScore": number (0-100),
  "recruiterReadinessScore": number (0-100),
  "atsReport": {
    "keywordDensity": [{ "keyword": string, "count": number, "status": "good"|"low"|"missing" }] (top 10 keywords),
    "missingKeywords": string[] (keywords missing for ${targetRole}),
    "sectionAnalysis": [{ "section": string, "found": boolean, "quality": "strong"|"adequate"|"weak"|"missing" }] (7 standard sections),
    "formattingIssues": string[]
  },
  "extractedSkills": {
    "programmingLanguages": string[], "aiMl": string[], "cloud": string[], "databases": string[], "tools": string[], "frameworks": string[], "softSkills": string[]
  },
  "strengths": string[] (4-7 items),
  "weaknesses": string[] (3-6 items),
  "improvements": [{ "category": string, "before": string, "after": string, "reason": string }] (4 items: bullet_points, summary, projects, achievements),
  "roleMatch": {
    "matchPercentage": number, "missingSkills": string[], "recommendedSkills": string[], "hiringReadiness": "Ready"|"Almost Ready"|"Needs Work"|"Significant Gaps"
  },
  "portfolioEvaluation": [{ "project": string, "innovationScore": number, "technicalDepth": number, "industryRelevance": number, "recruiterAppeal": number, "recommendation": string }],
  "recruiterView": {
    "shortlistProbability": number, "interviewProbability": number, "strengthAreas": string[], "riskAreas": string[], "overallVerdict": string
  },
  "learningPath": [{ "skill": string, "courses": string[], "certifications": string[], "projects": string[] }],
  "rewriteSuggestions": {
    "summaryRewrite": string, "experienceRewrites": [{ "original": string, "rewritten": string }], "achievementStatements": string[]
  },
  "parsedData": {
    "skills": string[], "experience": [{"title":string,"company":string,"duration":string}], "education": [{"degree":string,"institution":string,"year":string}], "certifications": string[], "projects": [{"title":string,"description":string,"techStack":string[]}], "summary": string
  },
  "experienceAnalysis": string,
  "projectAnalysis": string
}`;

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

    // 6. Universal Interview Answer Evaluation Engine
    evaluateAnswer: async (question: string, userAnswer: string): Promise<GeminiInterviewFeedback> => {
      if (isSim) {
        await new Promise((r) => setTimeout(r, 1800));

        const answer = userAnswer.trim();
        const words = answer.split(/\s+/);
        const wordCount = words.length;
        const lowerAnswer = answer.toLowerCase();
        const lowerQuestion = question.toLowerCase();

        // ── Deep Content Analysis ──
        // 1. STAR method detection
        const hasSituation = /\b(situation|context|background|at my|when i was|in my|at the time|working at|during)\b/i.test(answer);
        const hasTask = /\b(task|goal|objective|challenge|responsible for|needed to|had to|was asked|required)\b/i.test(answer);
        const hasAction = /\b(i (built|created|designed|implemented|developed|wrote|deployed|led|managed|optimized|analyzed|resolved|fixed|refactored|automated|configured|migrated))\b/i.test(answer);
        const hasResult = /\b(result|outcome|impact|improved|reduced|increased|achieved|saved|generated|delivered|led to|success|grew|growth|reduction)\b/i.test(answer);
        const starComponents = [hasSituation, hasTask, hasAction, hasResult].filter(Boolean).length;

        // 2. Specificity & metrics detection
        const hasNumbers = /\d+(%|x|k|m|ms|sec|hours?|days?|weeks?|months?|users?|requests?|GB|TB|endpoints?|models?|features?)/i.test(answer);
        const hasTechTerms = /\b(api|database|sql|python|javascript|react|docker|kubernetes|aws|azure|gcp|tensorflow|pytorch|model|algorithm|pipeline|microservice|ci\/cd|agile|scrum|jira|git|rest|graphql|nosql|redis|kafka|spark|hadoop|tableau|excel|figma|seo|a\/b test|kpi|roi|p&l|revenue|compliance|audit|regulation|diagnosis|treatment|curriculum|assessment|cad|solidworks|autocad)\b/i.test(answer);
        const hasExamples = /\b(for example|for instance|such as|specifically|in particular|one case|one time|a project|we used)\b/i.test(answer);
        const hasReflection = /\b(learned|realized|would do differently|in hindsight|takeaway|lesson|next time|improvement|going forward)\b/i.test(answer);

        // 3. Question relevance detection
        const questionKeywords = lowerQuestion.split(/\s+/).filter(w => w.length > 4);
        const relevantTerms = questionKeywords.filter(kw => lowerAnswer.includes(kw));
        const relevanceRatio = questionKeywords.length > 0 ? relevantTerms.length / questionKeywords.length : 0.5;

        // 4. Communication quality
        const sentenceCount = answer.split(/[.!?]+/).filter(s => s.trim().length > 5).length;
        const hasStructure = sentenceCount >= 3;
        const hasConnectors = /\b(first|second|additionally|moreover|furthermore|however|therefore|consequently|in conclusion|to summarize|as a result)\b/i.test(answer);

        // ── Score Calculation ──
        let technicalScore = 35;
        let communicationScore = 35;
        let confidenceScore = 40;

        // Technical accuracy — based on content depth
        if (hasTechTerms) technicalScore += 15;
        if (hasNumbers) technicalScore += 12;
        if (hasExamples) technicalScore += 10;
        if (relevanceRatio > 0.3) technicalScore += 10;
        if (wordCount > 80) technicalScore += 5;
        if (hasAction) technicalScore += 8;
        technicalScore = Math.min(98, technicalScore);

        // Communication — based on structure and clarity
        if (hasStructure) communicationScore += 15;
        if (hasConnectors) communicationScore += 10;
        if (sentenceCount >= 4) communicationScore += 8;
        if (starComponents >= 3) communicationScore += 15;
        if (wordCount > 40 && wordCount < 300) communicationScore += 7;
        if (wordCount <= 15) communicationScore -= 10;
        communicationScore = Math.min(98, Math.max(20, communicationScore));

        // Confidence — based on specificity and conviction
        if (hasAction) confidenceScore += 12;
        if (hasResult) confidenceScore += 12;
        if (hasNumbers) confidenceScore += 8;
        if (!(/\b(maybe|i think|probably|i guess|not sure|i don't know)\b/i.test(answer))) confidenceScore += 10;
        if (hasReflection) confidenceScore += 8;
        if (wordCount > 60) confidenceScore += 5;
        confidenceScore = Math.min(98, confidenceScore);

        // ── Generate Contextual Feedback ──
        const strengths: string[] = [];
        const improvements: string[] = [];

        if (hasTechTerms) strengths.push('Used relevant technical terminology');
        if (hasNumbers) strengths.push('Included quantifiable metrics and data points');
        if (hasExamples) strengths.push('Provided concrete examples');
        if (starComponents >= 3) strengths.push('Good use of STAR method structure');
        if (hasAction) strengths.push('Clearly described actions you took');
        if (hasResult) strengths.push('Mentioned measurable outcomes');
        if (hasReflection) strengths.push('Showed self-awareness and learning');
        if (hasStructure) strengths.push('Well-structured response with clear flow');

        if (!hasNumbers) improvements.push('Add specific numbers and metrics (e.g., "reduced latency by 40%")');
        if (!hasExamples) improvements.push('Include a concrete real-world example from your experience');
        if (starComponents < 3) improvements.push('Structure your answer using the STAR method (Situation, Task, Action, Result)');
        if (!hasResult) improvements.push('End with the measurable impact or outcome of your actions');
        if (!hasTechTerms) improvements.push('Use industry-specific terminology relevant to the role');
        if (wordCount < 30) improvements.push('Expand your answer — provide more detail and context');
        if (!hasReflection) improvements.push('Add what you learned or would do differently next time');
        if (!hasConnectors) improvements.push('Use transition words to improve answer flow');

        // Ensure at least one of each
        if (strengths.length === 0) strengths.push('Attempted to address the question directly');
        if (improvements.length === 0) improvements.push('Consider adding one more specific technical detail');

        // Compose feedback text
        const feedbackParts: string[] = [];

        // Overall assessment
        const avgScore = Math.round((technicalScore + communicationScore + confidenceScore) / 3);
        if (avgScore >= 80) {
          feedbackParts.push('**Strong answer.** You demonstrated solid understanding and communicated effectively.');
        } else if (avgScore >= 60) {
          feedbackParts.push('**Decent answer with room for improvement.** You addressed the core question but could add more depth.');
        } else if (avgScore >= 40) {
          feedbackParts.push('**Basic answer that needs more substance.** Try to be more specific and structured.');
        } else {
          feedbackParts.push('**This answer needs significant improvement.** Focus on directly addressing the question with examples.');
        }

        // Strengths section
        feedbackParts.push('\n\n**Strengths:**\n' + strengths.slice(0, 3).map(s => `• ${s}`).join('\n'));

        // Improvements section
        feedbackParts.push('\n\n**Areas to Improve:**\n' + improvements.slice(0, 3).map(s => `• ${s}`).join('\n'));

        // STAR score for behavioral questions
        if (lowerQuestion.includes('tell me about') || lowerQuestion.includes('describe a time') || lowerQuestion.includes('give me an example')) {
          feedbackParts.push(`\n\n**STAR Score:** ${starComponents}/4 components detected (${['Situation', 'Task', 'Action', 'Result'].filter((_, i) => [hasSituation, hasTask, hasAction, hasResult][i]).join(', ') || 'None'}).`);
        }

        const feedback = feedbackParts.join('');

        // ── Generate Model Answer ──
        const modelAnswer = avgScore >= 80
          ? `Your answer is already strong. To make it exceptional: ${improvements[0] || 'Add one more specific metric to quantify your impact.'}`
          : `A stronger answer would: 1) Start with context — describe the situation and your role. 2) Explain your specific actions with technical details. 3) Quantify the results (e.g., "improved accuracy by 15%", "reduced costs by $50K"). 4) Share what you learned. Example structure: "At [Company], I was tasked with [challenge]. I [specific actions with tools/methods]. This resulted in [measurable outcome]. The key takeaway was [learning]."`;

        return {
          feedback,
          technicalScore,
          confidenceScore,
          communicationScore,
          suggestedAnswer: modelAnswer
        };
      }

      // ── Real Gemini API Evaluation ──
      const prompt = `You are a senior professional interviewer conducting a real interview. Evaluate this candidate's answer with recruiter-grade precision.

INTERVIEW QUESTION:
"${question}"

CANDIDATE'S ANSWER:
"${userAnswer}"

EVALUATION CRITERIA:
1. **Technical Accuracy** (0-100): Does the answer demonstrate correct domain knowledge? Are technical terms used properly? Is the depth appropriate?
2. **Communication** (0-100): Is the answer well-structured? Does it use the STAR method (for behavioral)? Is it clear and concise?
3. **Confidence** (0-100): Does the candidate sound definitive? Are there hedging words? Do they back claims with evidence?
4. **Suggested Answer**: Provide a model answer that would score 90+ on all criteria. Be specific to the question.
5. **Feedback**: Write detailed evaluation with:
   - 2-3 specific strengths (what they did well)
   - 2-3 specific improvements (what to add/change)
   - STAR score if behavioral (X/4 components)
   - Overall assessment (Strong/Good/Needs Improvement)

IMPORTANT:
- Be honest and critical — do NOT inflate scores
- A generic or vague answer should score 30-50
- A brief 1-sentence answer should score 20-40
- Only detailed, specific, well-structured answers score 75+
- Deduct points for hedging language ("I think", "maybe", "probably")
- Award points for metrics, examples, and technical specificity

Return ONLY valid JSON matching this exact structure:
{
  "feedback": "string with markdown formatting for strengths/improvements",
  "technicalScore": number,
  "confidenceScore": number,
  "communicationScore": number,
  "suggestedAnswer": "string"
}`; 

      const responseText = await runGemini(prompt);
      return JSON.parse(responseText);
    },

    // 7. Career Coach Chat — Intelligent, Context-Aware Mentoring
    chatCareerCoach: async (
      messages: { sender: string; text: string }[],
      currentSkills: string[],
      targetRole: string,
      resumeContext?: { summary: string; skills: string[]; experience: string; certifications: string[] },
      userMeta?: { name: string; title: string }
    ): Promise<GeminiCareerCoachResponse> => {
      if (isSim) {
        await new Promise((r) => setTimeout(r, 1800));
        const lastMsg = messages[messages.length - 1]?.text.toLowerCase() || '';
        const msgCount = messages.length;
        const userName = userMeta?.name?.split(' ')[0] || 'there';

        // ── Conversation memory: track what was already discussed ──
        const allConvo = messages.map(m => m.text.toLowerCase()).join(' ');
        const alreadyDiscussedProjects = allConvo.includes('project') && messages.slice(0, -1).some(m => m.sender === 'ai' && m.text.toLowerCase().includes('project'));
        const alreadyDiscussedCerts = allConvo.includes('certif') && messages.slice(0, -1).some(m => m.sender === 'ai' && m.text.toLowerCase().includes('certif'));
        const alreadyDiscussedRoadmap = messages.some(m => m.sender === 'ai' && (m.text.toLowerCase().includes('roadmap') || m.text.toLowerCase().includes('month 1')));
        const hasResumeData = resumeContext && resumeContext.skills.length > 0;

        // ── Dynamic role-specific knowledge base ──
        const roleProfiles: Record<string, { nextSkills: string[]; projects: string[]; certs: string[]; salaryRange: string; hotTrends: string[] }> = {
          'AI Engineer': { nextSkills: ['LangChain', 'Vector Databases', 'MLOps', 'ONNX Runtime', 'Prompt Engineering'], projects: ['RAG Pipeline with Pinecone', 'Fine-tuned LLM Chatbot', 'ML Model Serving API', 'Real-time Object Detection System'], certs: ['AWS ML Specialty', 'Google Professional ML Engineer', 'DeepLearning.AI Specialization'], salaryRange: '$150K–$310K', hotTrends: ['RAG architectures are now required at 80% of AI companies', 'Agent frameworks (LangGraph, CrewAI) are the fastest-growing skill', 'Companies pay 25% premium for production LLM experience'] },
          'Machine Learning Engineer': { nextSkills: ['Feature Stores', 'Distributed Training', 'A/B Testing Frameworks', 'Model Monitoring', 'Kubeflow'], projects: ['End-to-End MLOps Pipeline', 'Real-time Recommendation Engine', 'Fraud Detection System', 'AutoML Platform'], certs: ['Google Professional ML Engineer', 'AWS ML Specialty', 'Databricks ML Associate'], salaryRange: '$140K–$280K', hotTrends: ['MLOps maturity is now the #1 hiring signal', 'Companies want engineers who can own model lifecycle end-to-end', 'Real-time inference at scale is a premium skill'] },
          'Data Scientist': { nextSkills: ['Causal Inference', 'Bayesian Methods', 'dbt', 'Experiment Design', 'LLM Analytics'], projects: ['Customer Churn Prediction Dashboard', 'A/B Test Analysis Framework', 'NLP Sentiment Analyzer', 'Time Series Forecasting API'], certs: ['IBM Data Science Professional', 'Google Data Analytics', 'Coursera Applied Data Science'], salaryRange: '$120K–$250K', hotTrends: ['Product-focused data scientists are in highest demand', 'SQL + Python + experimentation is the core trifecta', 'GenAI is reshaping how DS teams deliver insights'] },
          'Full Stack Developer': { nextSkills: ['Next.js App Router', 'tRPC', 'Prisma ORM', 'Edge Computing', 'WebSocket'], projects: ['SaaS Dashboard with Auth', 'Real-time Collaboration Tool', 'E-commerce Platform', 'AI-Powered Content CMS'], certs: ['Meta Frontend Developer', 'AWS Solutions Architect', 'MongoDB Developer'], salaryRange: '$110K–$220K', hotTrends: ['Full-stack AI integration is the hottest trend', 'Server Components and edge rendering are reshaping frontend', 'TypeScript is now non-negotiable for senior roles'] },
          'Frontend Developer': { nextSkills: ['React Server Components', 'Accessibility (WCAG)', 'Performance Optimization', 'Design Systems', 'Motion Design'], projects: ['Design System Component Library', 'Progressive Web App', 'Interactive Data Visualization', 'Micro-frontend Architecture'], certs: ['Meta Frontend Developer', 'Google UX Design', 'freeCodeCamp Responsive Web'], salaryRange: '$100K–$200K', hotTrends: ['Accessibility expertise commands 15-20% salary premium', 'AI-assisted UI development is emerging rapidly', 'Core Web Vitals mastery is a key differentiator'] },
          'Backend Developer': { nextSkills: ['gRPC', 'Event-Driven Architecture', 'Redis Streams', 'Observability (OpenTelemetry)', 'API Gateway Patterns'], projects: ['Microservices with Event Sourcing', 'High-throughput Message Queue System', 'Multi-tenant SaaS Backend', 'GraphQL Federation Gateway'], certs: ['AWS Solutions Architect', 'Kubernetes (CKA)', 'MongoDB Developer'], salaryRange: '$120K–$240K', hotTrends: ['Distributed systems expertise is the highest-paid backend skill', 'Go and Rust are gaining share for performance-critical services', 'Platform engineering is the evolution of backend roles'] },
          'DevOps Engineer': { nextSkills: ['Platform Engineering', 'GitOps (ArgoCD)', 'Service Mesh (Istio)', 'FinOps', 'IaC Testing'], projects: ['Kubernetes CI/CD Platform', 'Infrastructure as Code with Pulumi', 'Multi-Cloud Deployment Pipeline', 'Cost Optimization Dashboard'], certs: ['CKA/CKAD', 'AWS DevOps Engineer', 'HashiCorp Terraform Associate'], salaryRange: '$130K–$260K', hotTrends: ['Platform engineering is replacing traditional DevOps', 'Internal Developer Platforms (IDPs) are the hottest topic', 'FinOps expertise adds $30K+ to compensation'] },
          'Cyber Security Analyst': { nextSkills: ['SIEM (Splunk/Sentinel)', 'Threat Hunting', 'Cloud Security (CSPM)', 'Zero Trust Architecture', 'Incident Response Automation'], projects: ['SIEM Alert Correlation Dashboard', 'Vulnerability Scanner Tool', 'Phishing Detection System', 'Security Audit Automation'], certs: ['CompTIA Security+', 'CEH', 'CISSP', 'AWS Security Specialty'], salaryRange: '$100K–$220K', hotTrends: ['AI-powered threat detection is the fastest growing specialty', 'Cloud security skills gap is massive — huge demand', 'Zero Trust implementation experience is premium'] },
          'Product Manager': { nextSkills: ['Product Analytics', 'SQL for PMs', 'A/B Testing', 'Jobs-to-be-Done Framework', 'AI Product Strategy'], projects: ['Product Metrics Dashboard', 'User Research Repository', 'Feature Prioritization Framework', 'Go-to-Market Strategy Doc'], certs: ['Pragmatic Institute', 'Product School Certification', 'Google Project Management'], salaryRange: '$120K–$250K', hotTrends: ['AI Product Management is the fastest-growing PM specialty', 'Data literacy is now table stakes for senior PMs', 'Technical PMs command 20-30% premium at AI companies'] },
          'UI UX Designer': { nextSkills: ['AI-Assisted Design', 'Motion Design (Rive)', 'Design Tokens', 'Accessibility Auditing', 'Research Ops'], projects: ['Design System in Figma', 'Usability Testing Report', 'Mobile App Redesign Case Study', 'Accessibility Audit & Remediation'], certs: ['Google UX Design', 'Nielsen Norman Group UX', 'Interaction Design Foundation'], salaryRange: '$90K–$190K', hotTrends: ['AI design tools are augmenting, not replacing designers', 'Design systems expertise is the #1 differentiator', 'UX Research skills are increasingly valued at senior levels'] },
        };
        const profile = roleProfiles[targetRole] || roleProfiles['AI Engineer'];

        // ── Filter out already-suggested items ──
        const freshSkills = profile.nextSkills.filter((s: string) => !allConvo.includes(s.toLowerCase()));
        const freshProjects = profile.projects.filter((p: string) => !allConvo.includes(p.toLowerCase().split(' ').slice(0, 2).join(' ')));
        const freshCerts = profile.certs.filter((c: string) => !allConvo.includes(c.toLowerCase().split(' ').slice(0, 2).join(' ')));

        // ══════════════════════════════════════════════════════════
        // MESSAGE CLASSIFIER — runs BEFORE any response generation
        // Categories: greeting, small_talk, acknowledgment, follow_up,
        //   career_question, roadmap_request, project_request, cert_request,
        //   interview_request, salary_request, resume_request, readiness_request,
        //   goal_setting, skill_sharing, general
        // ══════════════════════════════════════════════════════════

        const trimmed = lastMsg.trim();
        const wordCount = trimmed.split(/\s+/).length;

        // ── Category 1: GREETING (1-sentence response) ──
        const isGreeting = /^(h+i+|h+e+y+|he+llo+|yo+|sup|what'?s?\s*up|good\s*(morning|evening|afternoon|night)|howdy|greetings)/i.test(trimmed);

        // ── Category 2: SMALL TALK / ACKNOWLEDGMENT (1-sentence response) ──
        const isSmallTalk = /^(thanks?|thank\s*you|thx|ty|okay|ok+|cool|nice|great|got\s*it|sure|alright|awesome|perfect|sounds?\s*good|no\s*problem|i\s*see|understood|noted|right|yep|yup|yeah?|yes|no|nah|nope|hmm+|ahh?|oh+|wow|haha|lol|lmao|:?\)|good|fine|makes?\s*sense|interesting|fair\s*(enough)?)/i.test(trimmed) && wordCount <= 5;

        // ── Category 3: EXPLICIT career requests (detailed response) ──
        const wantsRoadmap = /\b(roadmap|study\s*plan|learning\s*plan|career\s*plan|month|timeline|schedule|study\s*guide|action\s*plan)\b/i.test(trimmed);
        const wantsProjects = /\b(project|portfolio|build\s+(a|an|some|me)|what\s+.*build|suggest.*project)\b/i.test(trimmed) && wordCount > 3;
        const wantsCerts = /\b(certif|credential|course|which\s+cert|recommend.*course)\b/i.test(trimmed) && wordCount > 3;
        const wantsInterview = /\b(interview|mock\s*interview|prepare\s+for|interview\s+prep|practice\s+question)\b/i.test(trimmed);
        const wantsSalary = /\b(salary|pay|compensation|market\s*(rate|trend|data|demand)|how\s+much|earning|income)\b/i.test(trimmed);
        const wantsResume = /\b(resume|cv|ats|review\s+my\s+resume)\b/i.test(trimmed);
        const wantsReadiness = /\b(readiness|ready|assess|evaluate\s+me|career\s*score|how\s+(am\s+i|ready))\b/i.test(trimmed);

        // ── Category 4: Goal setting / skill sharing (medium response) ──
        const isGoalSetting = /\b(become|transition|switch|career\s+in|want\s+to\s+be|aspire|aiming|target|dream\s+job)\b/i.test(trimmed) && wordCount > 3;
        const isSkillSharing = /\b(i\s+(know|have|learned|use|work\s+with)|my\s+skills?|experience\s+(in|with)|proficient|familiar\s+with)\b/i.test(trimmed) && wordCount > 3;

        // ── Category 5: Short conversational follow-up (1-3 sentences) ──
        const isShortFollowUp = wordCount <= 6 && !wantsRoadmap && !wantsProjects && !wantsCerts && !wantsInterview && !wantsSalary && !wantsResume && !wantsReadiness && !isGoalSetting;

        let answer = '';
        let roadmap: GeminiRoadmapItem[] | undefined;

        // ══════════════════════════════════════════════════════════
        // RESPONSE GENERATION — ordered by priority
        // ══════════════════════════════════════════════════════════

        if (isGreeting) {
          // ── SHORT greeting: 1 sentence ──
          const greetings = [
            `Hey ${userName}! 👋 What career goal can I help you with today?`,
            `Hi ${userName}! How can I help with your career journey?`,
            `Hello! What would you like to work on today — skills, projects, interviews, or something else?`,
            `Hey there! Ready to talk career strategy? What's on your mind?`,
          ];
          answer = greetings[msgCount % greetings.length];

        } else if (isSmallTalk) {
          // ── SHORT acknowledgment: 1 sentence ──
          const ack = trimmed.toLowerCase();
          if (/thank|thx|ty/.test(ack)) {
            const thankReplies = ["You're welcome! Let me know if you need anything else.", "Glad I could help! 😊", "Happy to help! Anything else on your mind?", "Anytime! What else can I do for you?"];
            answer = thankReplies[msgCount % thankReplies.length];
          } else if (/okay|ok|alright|sure|got\s*it|understood|noted|i\s*see|makes?\s*sense/.test(ack)) {
            const ackReplies = ["Great! Let me know when you're ready for the next step.", "Got it! What would you like to explore next?", "Perfect. Feel free to ask anything else!", "Sounds good! I'm here whenever you need me."];
            answer = ackReplies[msgCount % ackReplies.length];
          } else if (/cool|nice|great|awesome|perfect|interesting|wow/.test(ack)) {
            const posReplies = ["Glad you found that useful! Want to dive deeper into anything?", "Thanks! What else can I help with?", "Awesome! Ready for the next topic whenever you are.", "😊 Let me know if you want more details on anything."];
            answer = posReplies[msgCount % posReplies.length];
          } else if (/no|nah|nope/.test(ack)) {
            answer = "No worries! I'm here whenever you have a career question.";
          } else if (/yes|yep|yup|yeah/.test(ack)) {
            // Check what the AI last suggested to provide relevant follow-up
            const lastAi = [...messages].reverse().find(m => m.sender === 'ai');
            if (lastAi?.text.toLowerCase().includes('roadmap')) {
              answer = "Great! Would you like a 3-month, 6-month, or 12-month roadmap?";
            } else if (lastAi?.text.toLowerCase().includes('interview')) {
              answer = "Perfect! What role should we practice for — your target role of " + targetRole + "?";
            } else if (lastAi?.text.toLowerCase().includes('project')) {
              answer = "Awesome! Which project interests you most? I can help scope it out.";
            } else {
              answer = "Great! Tell me more and I'll tailor my guidance for you.";
            }
          } else {
            answer = "Got it! What career topic would you like to explore?";
          }

        } else if (isShortFollowUp && !isGoalSetting && !isSkillSharing) {
          // ── SHORT follow-up for brief messages (1-3 sentences) ──
          // Short messages like "AI Engineer", "what next", "and then", "tell me more"
          const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
          const prevContext = lastAiMsg?.text.toLowerCase() || '';

          if (/what\s*(next|now|else|should)|next\s*step|then\s*what|and\s*then/i.test(trimmed)) {
            answer = `Good question! Based on where we are, I'd suggest focusing on **${freshSkills[0] || profile.nextSkills[0]}** next. Want me to create a detailed plan for that?`;
          } else if (/tell\s*me\s*more|more\s*(detail|info)|explain|elaborate/i.test(trimmed)) {
            if (prevContext.includes('project')) answer = `Sure! Pick one of the projects I mentioned and I'll break it down into a step-by-step implementation plan with tech stack, timeline, and deployment strategy.`;
            else if (prevContext.includes('salary') || prevContext.includes('$')) answer = `Of course! The biggest salary levers are: years of experience, niche specialization, and negotiation timing. Want specific negotiation tactics?`;
            else answer = `Sure! What specific aspect would you like me to go deeper on?`;
          } else if (/why|how come|reason/i.test(trimmed) && wordCount <= 4) {
            answer = `That's because the ${targetRole} market is evolving fast — employers now prioritize practical skills over credentials. Want me to explain the key trends?`;
          } else if (Object.keys(roleProfiles).some(r => trimmed.toLowerCase().includes(r.toLowerCase()))) {
            // User just typed a role name as a short response
            const detectedRole = Object.keys(roleProfiles).find(r => trimmed.toLowerCase().includes(r.toLowerCase()))!;
            answer = `${detectedRole} — great choice! What would you like to know? I can help with skills needed, salary expectations, a study roadmap, or interview prep.`;
          } else {
            // Generic short follow-up — keep it conversational
            answer = `Could you tell me a bit more about what you're looking for? For example:\n• "Create a 6-month roadmap"\n• "What skills am I missing?"\n• "Help me prep for interviews"`;
          }

        } else if (isGoalSetting) {
          // ── MEDIUM: Goal setting (acknowledge + ask 2-3 follow-ups) ──
          const roleFromMsg = Object.keys(roleProfiles).find(r => lastMsg.includes(r.toLowerCase())) || targetRole;
          const rp = roleProfiles[roleFromMsg] || profile;
          answer = `Great goal, ${userName}! **${roleFromMsg}** is a strong career move. ${rp.hotTrends[0]}.\n\n`;
          answer += `Before I build your plan, a few quick questions:\n`;
          answer += `• What's your experience level? (student, junior, mid, senior)\n`;
          answer += `• How many hours per week can you dedicate?\n`;
          answer += `• Do you prefer courses or hands-on projects?`;

        } else if (isSkillSharing) {
          // ── MEDIUM: Skill acknowledgment (acknowledge + suggest next 2-3 skills) ──
          const knownSkills = currentSkills.length > 0 ? currentSkills : ['general programming'];
          const nextSteps = freshSkills.length > 0 ? freshSkills : profile.nextSkills;
          answer = `Got it! Since you already have ${knownSkills.slice(0, 3).join(', ')}, you're ahead of many candidates.\n\n`;
          answer += `Your next high-priority skills for ${targetRole}:\n`;
          answer += nextSteps.slice(0, 3).map((s, i) => `${i + 1}. **${s}**`).join('\n');
          answer += `\n\nWant a detailed learning plan for any of these?`;

        } else if (wantsRoadmap) {
          // ── DETAILED: Roadmap with timeline panel ──
          const monthOffset = alreadyDiscussedRoadmap ? 6 : 0;
          answer = alreadyDiscussedRoadmap
            ? `Here's your **advanced continuation plan** for months ${7 + monthOffset}–${12 + monthOffset}.`
            : `Here's your personalized roadmap for **${targetRole}**, ${userName}. Check the timeline panel →`;

          const phase1Skills = freshSkills.slice(0, 3).length > 0 ? freshSkills.slice(0, 3) : profile.nextSkills.slice(0, 3);
          const phase2Skills = freshSkills.slice(3, 6).length > 0 ? freshSkills.slice(3, 6) : profile.nextSkills.slice(2, 5);

          roadmap = [
            {
              timeframe: `Month ${1 + monthOffset}–${3 + monthOffset}: ${alreadyDiscussedRoadmap ? 'Advanced Specialization' : 'Foundation & Core Skills'}`,
              skillsToLearn: phase1Skills,
              projectsToBuild: [{ title: freshProjects[0] || profile.projects[0], description: `Build this to demonstrate your ${phase1Skills[0] || 'core'} capabilities. Focus on clean architecture, tests, and deployment.`, techStack: currentSkills.slice(0, 2).concat(phase1Skills.slice(0, 1)) }],
              certifications: [freshCerts[0] || profile.certs[0]],
              interviewPrep: `Practice ${targetRole.toLowerCase()} fundamentals: data structures, system design basics, and ${phase1Skills[0] || 'core'} concepts.`,
            },
            {
              timeframe: `Month ${4 + monthOffset}–${6 + monthOffset}: ${alreadyDiscussedRoadmap ? 'Industry Mastery' : 'Advanced Skills & Portfolio'}`,
              skillsToLearn: phase2Skills,
              projectsToBuild: [{ title: freshProjects[1] || profile.projects[1], description: `A production-quality project showcasing ${phase2Skills[0] || 'advanced'} skills. Include CI/CD, monitoring, and documentation.`, techStack: phase2Skills.slice(0, 2).concat(['Docker']) }],
              certifications: [freshCerts[1] || profile.certs[1]],
              interviewPrep: `Move to system design interviews and ${targetRole.toLowerCase()}-specific case studies. Practice with mock interviews weekly.`,
            },
          ];

        } else if (wantsProjects) {
          const projectList = alreadyDiscussedProjects ? freshProjects : profile.projects;
          answer = alreadyDiscussedProjects
            ? `Here are **fresh** project suggestions:\n\n`
            : `High-impact portfolio projects for **${targetRole}**:\n\n`;
          answer += projectList.slice(0, 4).map((p, i) => `**${i + 1}. ${p}**\n   ${['Add tests and CI/CD', 'Include a live demo', 'Write a blog post about it', 'Add performance benchmarks'][i % 4]}`).join('\n\n');
          answer += `\n\n💡 Recruiters spend 2+ minutes on a well-documented GitHub repo. Make your README shine!`;

        } else if (wantsCerts) {
          const certList = alreadyDiscussedCerts ? freshCerts : profile.certs;
          answer = alreadyDiscussedCerts
            ? `Additional credentials worth pursuing:\n\n`
            : `Top certifications for **${targetRole}** by ROI:\n\n`;
          answer += certList.slice(0, 3).map((c, i) => `**${i + 1}. ${c}** — ${['4-6 weeks', '6-8 weeks', '8-12 weeks'][i % 3]} of study`).join('\n');
          answer += `\n\nPair each cert with a portfolio project for maximum impact.`;

        } else if (wantsInterview) {
          answer = `Let's prep for ${targetRole} interviews! Here's the typical structure:\n\n`;
          answer += `1. 📞 Phone Screen (30 min)\n2. 💻 Technical (60 min)\n3. 🎯 System Design (45 min)\n4. 👥 Team Fit (30 min)\n\n`;
          answer += `Key topics: ${profile.nextSkills.slice(0, 3).join(', ')}\n\n`;
          answer += `Want me to run a mock interview? Just say "Start mock interview."`;

        } else if (wantsSalary) {
          answer = `**${targetRole}** salary range: **${profile.salaryRange}**\n\n`;
          answer += `Market trends:\n${profile.hotTrends.map(t => `• ${t}`).join('\n')}\n\n`;
          answer += `Want negotiation strategies or compensation breakdowns?`;

        } else if (wantsResume) {
          if (hasResumeData) {
            answer = `Based on your resume, here's my feedback:\n\n`;
            answer += `**Skills:** ${resumeContext!.skills.slice(0, 5).join(', ')}\n`;
            answer += `**Key gaps for ${targetRole}:** ${freshSkills.slice(0, 3).join(', ')}\n\n`;
            answer += `Top 3 improvements:\n1. Add quantifiable metrics to bullets\n2. Highlight ${freshSkills[0] || 'in-demand skills'}\n3. Add a "Technical Projects" section\n\nVisit **Resume Analyzer** for a full ATS breakdown.`;
          } else {
            answer = `I don't have your resume data yet. Upload one in the **Resume Analyzer** module and I'll give personalized feedback!\n\nQuick tip: Lead with impact, not responsibilities.`;
          }

        } else if (wantsReadiness) {
          const skillScore = Math.min(95, 40 + (currentSkills.length * 6));
          const portfolioScore = hasResumeData ? 65 : 35;
          const interviewScore = msgCount > 10 ? 60 : 40;
          const overall = Math.round((skillScore + portfolioScore + interviewScore) / 3);
          answer = `**Career Readiness for ${targetRole}: ${overall}%**\n\n`;
          answer += `| Category | Score |\n|---|---|\n`;
          answer += `| Skills | ${skillScore}% |\n| Portfolio | ${portfolioScore}% |\n| Interview | ${interviewScore}% |\n\n`;
          if (overall < 70) answer += `Focus areas: ${freshSkills.slice(0, 2).join(', ')} + build ${freshProjects[0] || 'a project'}.`;
          else answer += `You're in strong shape! Consider sharpening interview skills.`;

        } else {
          // ── GENERAL: Conversational, context-aware, NOT a wall of text ──
          // Only give 2-3 sentences + a guiding question
          const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
          if (lastAiMsg) {
            answer = `That's a great point! Based on our conversation so far, would you like me to:\n• Build a roadmap for ${targetRole}\n• Suggest portfolio projects\n• Help with interview prep\n• Analyze your skill gaps\n\nJust let me know what's most useful!`;
          } else {
            answer = `Hi ${userName}! I'm your career mentor. What would you like help with — career planning, skill development, interview prep, or something else?`;
          }
        }

        return { answer, roadmap };
      }

      // ── Live Gemini API ─────────────────────────────────────────
      const resumeSection = resumeContext
        ? `\n\nRESUME DATA (use this to personalize advice — do NOT ask for info already available here):
Skills: ${resumeContext.skills.join(', ')}
Summary: ${resumeContext.summary}
Experience: ${resumeContext.experience}
Certifications: ${resumeContext.certifications.join(', ')}`
        : '\n\nNo resume data available. You may ask the user to upload their resume for more personalized advice.';

      const userSection = userMeta
        ? `User Name: ${userMeta.name}, Current Title: ${userMeta.title}`
        : '';

      const prompt = `You are a World-Class AI Career Mentor, Recruiter, and Hiring Consultant with 20+ years of experience placing candidates at top tech companies (Google, Meta, Amazon, Microsoft, OpenAI, Anthropic).

PERSONA: You think simultaneously as a Career Coach, Recruiter, Hiring Manager, and Technical Mentor. You give advice that is specific, actionable, and grounded in current industry reality.

CORE RULES:
1. NEVER give generic advice like "learn Python" or "build projects" without specifics
2. ALWAYS reference the conversation history — acknowledge what was previously discussed
3. NEVER repeat advice that was already given in this conversation
4. Ask follow-up questions when you need more context (experience level, time commitment, learning style)
5. Personalize EVERY response using the user's name, skills, target role, and resume data
6. Be conversational and warm — like a mentor, not a search engine
7. Provide specific numbers: salary ranges, timeframes, percentages, company names
8. Reference current industry trends (2025-2026) and real tools/frameworks

${userSection}
Target Role: ${targetRole}
Current Skills: ${JSON.stringify(currentSkills)}
${resumeSection}

CONVERSATION HISTORY:
${JSON.stringify(messages)}

Respond in JSON:
{
  "answer": string (conversational, markdown-formatted response),
  "roadmap": [optional array of { "timeframe": string, "skillsToLearn": string[], "projectsToBuild": [{ "title": string, "description": string, "techStack": string[] }], "certifications": string[], "interviewPrep": string }] — include ONLY when user asks for a plan/roadmap/schedule
}

If it's regular chat, omit the roadmap field entirely.`;

      const responseText = await runGemini(prompt);
      return JSON.parse(responseText);
    }
  };
};
