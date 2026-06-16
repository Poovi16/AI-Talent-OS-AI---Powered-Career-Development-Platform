// e:/AI Talent OS/src/services/jobService.ts

export interface JSearchJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  employmentType: string;
  postedDate: string;
  description: string;
  applyUrl: string;
  companyLogo?: string;
  isRemote: boolean;
}

export interface JobSearchParams {
  query: string;
  location?: string;
  employmentType?: string;
  datePosted?: string;
  page?: number;
  numPages?: number;
}

export interface JobSearchResult {
  jobs: JSearchJob[];
  totalResults: number;
  page: number;
  hasMore: boolean;
  source: 'api' | 'fallback';
}

// ─────────────────────────── JSearch API Integration ───────────────────────────

const JSEARCH_BASE_URL = 'https://jsearch.p.rapidapi.com/search';

const getApiKey = (): string => {
  return import.meta.env.VITE_JSEARCH_API_KEY || '';
};

const formatSalary = (min?: number, max?: number, currency?: string): string => {
  const cur = currency || 'USD';
  if (min && max) return `$${(min / 1000).toFixed(0)}K – $${(max / 1000).toFixed(0)}K ${cur}`;
  if (min) return `From $${(min / 1000).toFixed(0)}K ${cur}`;
  if (max) return `Up to $${(max / 1000).toFixed(0)}K ${cur}`;
  return 'Salary not disclosed';
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'Recently posted';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recently posted';
  }
};

export const searchJobs = async (params: JobSearchParams): Promise<JobSearchResult> => {
  const apiKey = getApiKey();

  // If no API key is available, use the curated fallback dataset
  if (!apiKey) {
    return searchFallbackJobs(params);
  }

  try {
    const queryParams = new URLSearchParams({
      query: params.query,
      page: String(params.page || 1),
      num_pages: String(params.numPages || 1),
    });

    if (params.location) queryParams.set('query', `${params.query} in ${params.location}`);
    if (params.employmentType) queryParams.set('employment_types', params.employmentType);
    if (params.datePosted) queryParams.set('date_posted', params.datePosted);

    const response = await fetch(`${JSEARCH_BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      console.warn('JSearch API returned non-OK status, falling back to local data.');
      return searchFallbackJobs(params);
    }

    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobs: JSearchJob[] = (data.data || []).map((item: any) => ({
      id: item.job_id || `jsearch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: item.job_title || 'Untitled Position',
      company: item.employer_name || 'Unknown Company',
      location: item.job_city
        ? `${item.job_city}, ${item.job_state || ''} ${item.job_country || ''}`.trim()
        : item.job_country || 'Location not specified',
      salary: formatSalary(item.job_min_salary, item.job_max_salary, item.job_salary_currency),
      employmentType: item.job_employment_type || 'FULLTIME',
      postedDate: formatDate(item.job_posted_at_datetime_utc),
      description: item.job_description || 'No description available.',
      applyUrl: item.job_apply_link || '#',
      companyLogo: item.employer_logo || undefined,
      isRemote: item.job_is_remote || false,
    }));

    return {
      jobs,
      totalResults: data.num_results || jobs.length,
      page: params.page || 1,
      hasMore: jobs.length >= 10,
      source: 'api',
    };
  } catch (error) {
    console.error('JSearch API error, using fallback data:', error);
    return searchFallbackJobs(params);
  }
};

// ─────────────────────────── High-Fidelity Fallback Dataset ───────────────────────────

const FALLBACK_JOBS: JSearchJob[] = [
  {
    id: 'fb-1',
    title: 'Senior Machine Learning Engineer',
    company: 'Google DeepMind',
    location: 'Mountain View, CA (Hybrid)',
    salary: '$185,000 – $265,000 USD',
    employmentType: 'FULLTIME',
    postedDate: '3 days ago',
    description: 'Design and implement state-of-the-art machine learning models for large-scale production systems. Work with cross-functional teams to develop novel approaches for natural language understanding, recommendation systems, and computer vision. Requires strong Python, TensorFlow/JAX proficiency and experience with distributed training infrastructure.',
    applyUrl: 'https://careers.google.com',
    companyLogo: undefined,
    isRemote: false,
  },
  {
    id: 'fb-2',
    title: 'AI Platform Engineer',
    company: 'Microsoft',
    location: 'Redmond, WA (Hybrid)',
    salary: '$160,000 – $240,000 USD',
    employmentType: 'FULLTIME',
    postedDate: '1 week ago',
    description: 'Build and maintain the AI infrastructure powering Azure OpenAI Service. Design scalable microservice architectures, implement CI/CD pipelines for model deployment, and work closely with research scientists to productionize cutting-edge models. Experience with Kubernetes, Docker, and Python required.',
    applyUrl: 'https://careers.microsoft.com',
    companyLogo: undefined,
    isRemote: false,
  },
  {
    id: 'fb-3',
    title: 'Staff Software Engineer – Generative AI',
    company: 'Meta',
    location: 'Menlo Park, CA (Onsite)',
    salary: '$200,000 – $300,000 USD',
    employmentType: 'FULLTIME',
    postedDate: '5 days ago',
    description: 'Lead the development of generative AI features across Meta\'s family of apps. Build scalable systems for model serving, fine-tuning, and evaluation. Collaborate with research teams on LLM alignment and safety. Strong experience with PyTorch, distributed systems, and large-scale data processing required.',
    applyUrl: 'https://www.metacareers.com',
    companyLogo: undefined,
    isRemote: false,
  },
  {
    id: 'fb-4',
    title: 'NLP Research Scientist',
    company: 'OpenAI',
    location: 'San Francisco, CA (Onsite)',
    salary: '$250,000 – $370,000 USD',
    employmentType: 'FULLTIME',
    postedDate: 'Today',
    description: 'Conduct original research in natural language processing and contribute to the development of frontier models. Focus areas include alignment, RLHF, multi-modal reasoning, and retrieval-augmented generation. PhD in CS/AI or equivalent research experience, with publications at top venues.',
    applyUrl: 'https://openai.com/careers',
    companyLogo: undefined,
    isRemote: false,
  },
  {
    id: 'fb-5',
    title: 'Full Stack AI Developer',
    company: 'Anthropic',
    location: 'Remote (US)',
    salary: '$180,000 – $260,000 USD',
    employmentType: 'FULLTIME',
    postedDate: '2 days ago',
    description: 'Build developer-facing tools and dashboards for AI safety research. Work with React, TypeScript, Python, and FastAPI to create interfaces that enable researchers to evaluate model behavior. Experience with LLM integration, prompt engineering, and modern frontend architectures is highly valued.',
    applyUrl: 'https://www.anthropic.com/careers',
    companyLogo: undefined,
    isRemote: true,
  },
  {
    id: 'fb-6',
    title: 'MLOps Engineer',
    company: 'Amazon Web Services',
    location: 'Seattle, WA (Hybrid)',
    salary: '$155,000 – $230,000 USD',
    employmentType: 'FULLTIME',
    postedDate: '1 week ago',
    description: 'Design and operate ML infrastructure for SageMaker and Bedrock services. Build CI/CD pipelines for model training, validation, and deployment at scale. Manage GPU clusters and implement model drift monitoring. Requires Docker, Kubernetes, Terraform, and Python proficiency.',
    applyUrl: 'https://www.amazon.jobs',
    companyLogo: undefined,
    isRemote: false,
  },
  {
    id: 'fb-7',
    title: 'Data Scientist – Applied AI',
    company: 'Stripe',
    location: 'Remote (US)',
    salary: '$170,000 – $240,000 USD',
    employmentType: 'FULLTIME',
    postedDate: '4 days ago',
    description: 'Apply machine learning to detect fraud patterns, optimize payment routing, and improve risk scoring models. Work with large transaction datasets, build real-time inference systems, and collaborate with product teams. Strong Python, SQL, Pandas, and Scikit-Learn skills required.',
    applyUrl: 'https://stripe.com/jobs',
    companyLogo: undefined,
    isRemote: true,
  },
  {
    id: 'fb-8',
    title: 'Computer Vision Engineer',
    company: 'Tesla',
    location: 'Palo Alto, CA (Onsite)',
    salary: '$175,000 – $250,000 USD',
    employmentType: 'FULLTIME',
    postedDate: 'Yesterday',
    description: 'Develop and deploy computer vision algorithms for autonomous driving perception systems. Work on object detection, tracking, depth estimation, and sensor fusion using PyTorch and CUDA. Experience with real-time inference, model optimization, and large-scale video datasets required.',
    applyUrl: 'https://www.tesla.com/careers',
    companyLogo: undefined,
    isRemote: false,
  },
  {
    id: 'fb-9',
    title: 'AI Solutions Architect',
    company: 'NVIDIA',
    location: 'Santa Clara, CA (Hybrid)',
    salary: '$190,000 – $280,000 USD',
    employmentType: 'FULLTIME',
    postedDate: '6 days ago',
    description: 'Help enterprise customers design and implement AI solutions using NVIDIA GPU infrastructure. Provide technical guidance on model training, inference optimization, and deployment strategies. Strong knowledge of CUDA, TensorRT, Triton Inference Server, and cloud platforms required.',
    applyUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers/',
    companyLogo: undefined,
    isRemote: false,
  },
  {
    id: 'fb-10',
    title: 'Prompt Engineer & LLM Specialist',
    company: 'Databricks',
    location: 'Remote (US/Canada)',
    salary: '$145,000 – $210,000 USD',
    employmentType: 'FULLTIME',
    postedDate: '3 days ago',
    description: 'Design and optimize prompting strategies for enterprise AI features built on foundation models. Evaluate model outputs, build automated testing frameworks, and work with product teams to implement RAG pipelines. Experience with LangChain, vector databases, and LLM evaluation methodologies preferred.',
    applyUrl: 'https://www.databricks.com/company/careers',
    companyLogo: undefined,
    isRemote: true,
  },
  {
    id: 'fb-11',
    title: 'Backend Engineer – AI Infrastructure',
    company: 'Spotify',
    location: 'New York, NY (Hybrid)',
    salary: '$150,000 – $215,000 USD',
    employmentType: 'FULLTIME',
    postedDate: '1 week ago',
    description: 'Build backend infrastructure for ML-powered recommendation, search, and content understanding systems. Design microservices in Java/Python, manage data pipelines with Apache Beam, and deploy models at scale. Experience with GCP, Kubernetes, and real-time feature serving preferred.',
    applyUrl: 'https://www.lifeatspotify.com',
    companyLogo: undefined,
    isRemote: false,
  },
  {
    id: 'fb-12',
    title: 'Robotics ML Engineer',
    company: 'Boston Dynamics',
    location: 'Waltham, MA (Onsite)',
    salary: '$160,000 – $230,000 USD',
    employmentType: 'FULLTIME',
    postedDate: '2 weeks ago',
    description: 'Develop perception and planning algorithms for mobile robots using reinforcement learning and imitation learning. Work with ROS, C++, Python, and PyTorch to build real-time control systems. Research background in robotics, computer vision, or sim-to-real transfer is a strong plus.',
    applyUrl: 'https://bostondynamics.wd1.myworkdayjobs.com',
    companyLogo: undefined,
    isRemote: false,
  },
];

function searchFallbackJobs(params: JobSearchParams): JobSearchResult {
  const query = params.query.toLowerCase();
  const location = (params.location || '').toLowerCase();

  let filtered = FALLBACK_JOBS.filter((job) => {
    const matchesQuery =
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query);

    const matchesLocation = !location || job.location.toLowerCase().includes(location);

    const matchesType =
      !params.employmentType ||
      job.employmentType.toLowerCase() === params.employmentType.toLowerCase();

    return matchesQuery && matchesLocation && matchesType;
  });

  // If the query was too restrictive and returned nothing, show all jobs
  if (filtered.length === 0) {
    filtered = FALLBACK_JOBS;
  }

  const page = params.page || 1;
  const perPage = 6;
  const start = (page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  return {
    jobs: paged,
    totalResults: filtered.length,
    page,
    hasMore: start + perPage < filtered.length,
    source: 'fallback',
  };
}
