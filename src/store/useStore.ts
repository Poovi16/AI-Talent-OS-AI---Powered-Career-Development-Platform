import { create } from 'zustand';

export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  skills: string[];
  experience: string;
  resumeScore: number;
  matchScore: number;
  interviewScore: number;
  stage: 'applied' | 'screening' | 'shortlisted' | 'interview' | 'selected' | 'rejected';
  dateApplied: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  description: string;
  status: 'saved' | 'applied' | 'none';
  stage?: string;
  matchingSkills: string[];
  missingSkills: string[];
  suitabilityRating: 'High' | 'Medium' | 'Low';
}

export interface LearningCourse {
  id: string;
  title: string;
  platform: string;
  hours: number;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  category: string;
  targetSkill: string;
  link: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  title: string;
  skills: string[];
  targetRole: string;
  resumeUploaded: boolean;
  resumeFileName?: string;
  resumeScore?: number;
  atsScore?: number;
  missingSkills?: string[];
  improvements?: string[];
  technicalScore?: number;
  confidenceScore?: number;
  communicationScore?: number;
}

interface ApiSettings {
  geminiKey: string;
  isSimulator: boolean;
}

interface StoreState {
  activeRole: UserRole;
  activePage: string;
  apiSettings: ApiSettings;
  userProfile: UserProfile;
  candidates: Candidate[];
  jobs: Job[];
  learningCourses: LearningCourse[];
  coachMessages: Message[];
  activityLogs: string[];
  
  // Actions
  setActiveRole: (role: UserRole) => void;
  setActivePage: (page: string) => void;
  updateApiSettings: (settings: Partial<ApiSettings>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  setCandidates: (candidates: Candidate[]) => void;
  updateCandidateStage: (candidateId: string, stage: Candidate['stage']) => void;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'dateApplied'>) => void;
  toggleSaveJob: (jobId: string) => void;
  applyForJob: (jobId: string) => void;
  addCoachMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearCoachHistory: () => void;
  updateCourseProgress: (courseId: string, progress: number) => void;
  addActivityLog: (log: string) => void;
  resetStore: () => void;
}

const defaultCandidates: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Sarah Connor',
    email: 'sarah.c@skymail.io',
    phone: '+1 (555) 234-5678',
    title: 'Senior Machine Learning Engineer',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'CUDA', 'Docker', 'AWS'],
    experience: '6 Years',
    resumeScore: 92,
    matchScore: 95,
    interviewScore: 88,
    stage: 'shortlisted',
    dateApplied: '2026-06-10'
  },
  {
    id: 'cand-2',
    name: 'Marcus Wright',
    email: 'mwright@cybersystems.com',
    phone: '+1 (555) 876-5432',
    title: 'AI Product Specialist',
    skills: ['Agile', 'Product Roadmapping', 'LLMs', 'Prompt Engineering', 'SQL'],
    experience: '4 Years',
    resumeScore: 84,
    matchScore: 78,
    interviewScore: 85,
    stage: 'screening',
    dateApplied: '2026-06-12'
  },
  {
    id: 'cand-3',
    name: 'John Connor',
    email: 'j.connor@resistance.net',
    phone: '+1 (555) 999-1111',
    title: 'Generative AI Developer',
    skills: ['Python', 'TypeScript', 'LangChain', 'Node.js', 'React', 'FastAPI'],
    experience: '3 Years',
    resumeScore: 89,
    matchScore: 92,
    interviewScore: 94,
    stage: 'interview',
    dateApplied: '2026-06-14'
  },
  {
    id: 'cand-4',
    name: 'Katherine Brewster',
    email: 'kate.b@healthnet.org',
    phone: '+1 (555) 444-2222',
    title: 'Data Scientist',
    skills: ['R', 'Python', 'Pandas', 'Scikit-Learn', 'Tableau', 'StatsModels'],
    experience: '5 Years',
    resumeScore: 78,
    matchScore: 81,
    interviewScore: 75,
    stage: 'applied',
    dateApplied: '2026-06-15'
  },
  {
    id: 'cand-5',
    name: 'T-800 Model 101',
    email: 'cyberdyne101@skynet.com',
    phone: '+1 (000) 101-0101',
    title: 'Systems & Cybernetics Architecture Lead',
    skills: ['Assembly', 'C++', 'Neural Nets', 'Reinforcement Learning', 'Hardware Integration'],
    experience: '15 Years',
    resumeScore: 99,
    matchScore: 98,
    interviewScore: 99,
    stage: 'selected',
    dateApplied: '2026-06-08'
  }
];

const defaultJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Lead AI Software Engineer',
    company: 'Skynet Solutions',
    location: 'Los Angeles, CA (Hybrid)',
    salary: '$180,000 - $220,000',
    matchScore: 94,
    description: 'We are seeking a Lead AI Engineer to architect, build, and deploy large language models (LLMs) and computer vision algorithms. You will lead a small, high-performance team of developers.',
    status: 'none' as const,
    matchingSkills: ['Python', 'PyTorch', 'Docker', 'AWS'],
    missingSkills: ['Kubernetes', 'Go'],
    suitabilityRating: 'High' as const
  },
  {
    id: 'job-2',
    title: 'NLP Research Scientist',
    company: 'Cyberdyne Systems',
    location: 'Sunnyvale, CA (Onsite)',
    salary: '$190,000 - $240,000',
    matchScore: 82,
    description: 'Join our research group focusing on the limits of deep neural net transformer architectures. Build novel algorithms for sequence generation, alignment, and multi-modal integration.',
    status: 'saved' as const,
    matchingSkills: ['Python', 'TensorFlow', 'PyTorch'],
    missingSkills: ['JAX', 'Distributed Training'],
    suitabilityRating: 'High' as const
  },
  {
    id: 'job-3',
    title: 'Full Stack AI Product Engineer',
    company: 'NeuralCorp',
    location: 'Remote (US)',
    salary: '$140,000 - $175,000',
    matchScore: 68,
    description: 'Create user interfaces that interact with powerful generative AI backend models. Work with React, TypeScript, Node.js, and Python API wrappers to build the future of workflow automation.',
    status: 'none' as const,
    matchingSkills: ['Python', 'TypeScript', 'React', 'Node.js'],
    missingSkills: ['Next.js', 'Tailwind CSS'],
    suitabilityRating: 'Medium' as const
  },
  {
    id: 'job-4',
    title: 'Machine Learning DevOps Engineer',
    company: 'FutureTech AI',
    location: 'Seattle, WA (Remote friendly)',
    salary: '$160,000 - $195,000',
    matchScore: 75,
    description: 'Build CI/CD pipelines for training, validating, and serving machine learning models. Manage GPU clusters and model drift monitoring dashboards.',
    status: 'none' as const,
    matchingSkills: ['Docker', 'AWS', 'Python'],
    missingSkills: ['MLflow', 'Terraform', 'Kubernetes'],
    suitabilityRating: 'Medium' as const
  }
];

const defaultCourses: LearningCourse[] = [
  {
    id: 'course-1',
    title: 'Generative AI & LLM Fine-Tuning',
    platform: 'DeepLearning.AI',
    hours: 24,
    status: 'in-progress' as const,
    progress: 65,
    category: 'Model Tuning',
    targetSkill: 'PyTorch / LLMs',
    link: 'https://www.deeplearning.ai'
  },
  {
    id: 'course-2',
    title: 'Deploying Machine Learning Models (MLOps)',
    platform: 'Coursera',
    hours: 32,
    status: 'not-started' as const,
    progress: 0,
    category: 'DevOps',
    targetSkill: 'Docker / AWS',
    link: 'https://www.coursera.org'
  },
  {
    id: 'course-3',
    title: 'Next.js & React Dashboard Systems',
    platform: 'Frontend Masters',
    hours: 12,
    status: 'completed' as const,
    progress: 100,
    category: 'Frontend',
    targetSkill: 'TypeScript / React',
    link: 'https://frontendmasters.com'
  },
  {
    id: 'course-4',
    title: 'Vector Databases and Semantic Search',
    platform: 'Udemy',
    hours: 8,
    status: 'in-progress' as const,
    progress: 20,
    category: 'Data Engineering',
    targetSkill: 'Vector DBs / SQL',
    link: 'https://www.udemy.com'
  }
];

const defaultProfile: UserProfile = {
  name: 'Alex Mercer',
  email: 'alex.mercer@devmail.com',
  title: 'Full Stack Software Engineer',
  skills: ['Python', 'SQL', 'TypeScript', 'React', 'Node.js', 'Git'],
  targetRole: 'AI Engineer',
  resumeUploaded: false
};

const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Error reading localStorage', error);
    return defaultValue;
  }
};

const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing localStorage', error);
  }
};

export const useStore = create<StoreState>((set, get) => {
  // Initialize state from local storage or defaults
  const activeRole = getLocalStorage<UserRole>('ai_talent_role', 'candidate');
  const activePage = getLocalStorage<string>('ai_talent_page', 'dashboard');
  const apiSettings = getLocalStorage<ApiSettings>('ai_talent_api', { geminiKey: '', isSimulator: true });
  const userProfile = getLocalStorage<UserProfile>('ai_talent_profile', defaultProfile);
  const candidates = getLocalStorage<Candidate[]>('ai_talent_candidates', defaultCandidates);
  const jobs = getLocalStorage<Job[]>('ai_talent_jobs', defaultJobs);
  const learningCourses = getLocalStorage<LearningCourse[]>('ai_talent_courses', defaultCourses);
  const coachMessages = getLocalStorage<Message[]>('ai_talent_coach_msgs', [
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'Hello! I am your AI Career Coach. I can help you review your skill set, draft a study guide, suggest certificate programs, and plan projects to land your target role. What would you like to build today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const activityLogs = getLocalStorage<string[]>('ai_talent_logs', [
    'System initialized successfully.',
    'Default candidates & jobs database loaded.',
    'Mock API Simulator connected.'
  ]);

  return {
    activeRole,
    activePage,
    apiSettings,
    userProfile,
    candidates,
    jobs,
    learningCourses,
    coachMessages,
    activityLogs,

    setActiveRole: (role) => {
      set({ activeRole: role });
      setLocalStorage('ai_talent_role', role);
      get().addActivityLog(`Switched view role to ${role.toUpperCase()}.`);
    },
    
    setActivePage: (page) => {
      set({ activePage: page });
      setLocalStorage('ai_talent_page', page);
    },

    updateApiSettings: (settings) => {
      const updated = { ...get().apiSettings, ...settings };
      set({ apiSettings: updated });
      setLocalStorage('ai_talent_api', updated);
      get().addActivityLog(`API settings updated. Simulator mode: ${updated.isSimulator}.`);
    },

    updateUserProfile: (profile) => {
      const updated = { ...get().userProfile, ...profile };
      set({ userProfile: updated });
      setLocalStorage('ai_talent_profile', updated);
      get().addActivityLog(`User profile updated for ${updated.name}.`);
    },

    setCandidates: (cands) => {
      set({ candidates: cands });
      setLocalStorage('ai_talent_candidates', cands);
    },

    updateCandidateStage: (candidateId, stage) => {
      const updated = get().candidates.map(c => 
        c.id === candidateId ? { ...c, stage } : c
      );
      set({ candidates: updated });
      setLocalStorage('ai_talent_candidates', updated);
      
      const candName = get().candidates.find(c => c.id === candidateId)?.name || 'Candidate';
      get().addActivityLog(`Moved candidate ${candName} to stage: ${stage.toUpperCase()}.`);
    },

    addCandidate: (cand) => {
      const newCand: Candidate = {
        ...cand,
        id: `cand-${Date.now()}`,
        dateApplied: new Date().toISOString().split('T')[0]
      };
      const updated = [newCand, ...get().candidates];
      set({ candidates: updated });
      setLocalStorage('ai_talent_candidates', updated);
      get().addActivityLog(`Registered new candidate: ${cand.name}.`);
    },

    toggleSaveJob: (jobId) => {
      const updated = get().jobs.map(j => {
        if (j.id === jobId) {
          const newStatus = (j.status === 'saved' ? 'none' : 'saved') as 'none' | 'saved';
          get().addActivityLog(`${newStatus === 'saved' ? 'Saved' : 'Unsaved'} job: ${j.title} at ${j.company}.`);
          return { ...j, status: newStatus };
        }
        return j;
      });
      set({ jobs: updated });
      setLocalStorage('ai_talent_jobs', updated);
    },

    applyForJob: (jobId) => {
      const updated = get().jobs.map(j => {
        if (j.id === jobId) {
          get().addActivityLog(`Submitted job application for ${j.title} at ${j.company}.`);
          return { ...j, status: 'applied' as const };
        }
        return j;
      });
      set({ jobs: updated });
      setLocalStorage('ai_talent_jobs', updated);

      // Also register current user as a candidate in candidate portal database
      const profile = get().userProfile;
      const job = get().jobs.find(j => j.id === jobId);
      if (job) {
        get().addCandidate({
          name: profile.name,
          email: profile.email,
          phone: '+1 (555) 123-4567',
          title: profile.title,
          skills: profile.skills,
          experience: '3 Years',
          resumeScore: profile.resumeScore || 75,
          matchScore: job.matchScore,
          interviewScore: profile.technicalScore || 0,
          stage: 'applied'
        });
      }
    },

    addCoachMessage: (msg) => {
      const newMsg: Message = {
        ...msg,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const updated = [...get().coachMessages, newMsg];
      set({ coachMessages: updated });
      setLocalStorage('ai_talent_coach_msgs', updated);
    },

    clearCoachHistory: () => {
      const initMsg = [
        {
          id: 'msg-init',
          sender: 'ai' as const,
          text: 'Hello! I am your AI Career Coach. I can help you review your skill set, draft a study guide, suggest certificate programs, and plan projects to land your target role. What would you like to build today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      set({ coachMessages: initMsg });
      setLocalStorage('ai_talent_coach_msgs', initMsg);
    },

    updateCourseProgress: (courseId, progress) => {
      const updated = get().learningCourses.map(c => {
        if (c.id === courseId) {
          const status = (progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started') as 'completed' | 'in-progress' | 'not-started';
          return { ...c, progress, status };
        }
        return c;
      });
      set({ learningCourses: updated });
      setLocalStorage('ai_talent_courses', updated);
    },

    addActivityLog: (log) => {
      const newLog = `[${new Date().toLocaleTimeString()}] ${log}`;
      const updated = [newLog, ...get().activityLogs].slice(0, 50); // Keep last 50 logs
      set({ activityLogs: updated });
      setLocalStorage('ai_talent_logs', updated);
    },

    resetStore: () => {
      localStorage.removeItem('ai_talent_role');
      localStorage.removeItem('ai_talent_page');
      localStorage.removeItem('ai_talent_api');
      localStorage.removeItem('ai_talent_profile');
      localStorage.removeItem('ai_talent_candidates');
      localStorage.removeItem('ai_talent_jobs');
      localStorage.removeItem('ai_talent_courses');
      localStorage.removeItem('ai_talent_coach_msgs');
      localStorage.removeItem('ai_talent_logs');
      
      set({
        activeRole: 'candidate',
        activePage: 'dashboard',
        apiSettings: { geminiKey: '', isSimulator: true },
        userProfile: defaultProfile,
        candidates: defaultCandidates,
        jobs: defaultJobs,
        learningCourses: defaultCourses,
        coachMessages: [
          {
            id: 'msg-init',
            sender: 'ai',
            text: 'Hello! I am your AI Career Coach. I can help you review your skill set, draft a study guide, suggest certificate programs, and plan projects to land your target role. What would you like to build today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ],
        activityLogs: ['System reset to defaults.']
      });
    }
  };
});
