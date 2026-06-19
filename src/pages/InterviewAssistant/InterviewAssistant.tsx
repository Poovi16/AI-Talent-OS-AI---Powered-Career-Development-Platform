// e:/AI Talent OS/src/pages/InterviewAssistant/InterviewAssistant.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { getGeminiClient } from '../../services/geminiService';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import answerDB from './interviewAnswerDB';
import {
  Video, Award, RefreshCw, Send, CheckCircle2, Search, ChevronDown,
  Target, TrendingUp, BarChart3, Zap, Shield, Star, GraduationCap, Sparkles,
  MessageSquare, Clock, User, Bot, ArrowRight, BookOpen, Eye, EyeOff,
  Lightbulb, AlertTriangle, ListChecks
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// CAREER LIBRARY — 46 roles for interview simulation
// ═══════════════════════════════════════════════════════════════

interface InterviewRole {
  role: string;
  domain: string;
  sampleQuestions: { technical: string[]; behavioral: string[]; hr: string[]; caseStudy?: string[] };
}

const interviewRoles: InterviewRole[] = [
  // ─── Technology ────────────────────────────
  { role: 'AI Engineer', domain: 'Technology', sampleQuestions: { technical: ['Explain the difference between fine-tuning and RAG. When would you choose one over the other?', 'How would you design a production ML inference pipeline that handles 10K requests/second?', 'What are the key challenges in deploying LLMs to production?', 'Explain transformer attention mechanism and its computational complexity.', 'How do you evaluate the quality of a RAG system?'], behavioral: ['Describe a time you had to optimize an expensive model query. What parameters did you adjust?', 'Tell me about a project where the ML model underperformed in production. How did you debug it?', 'How do you handle disagreements about model architecture choices with your team?'], hr: ['Why AI Engineering specifically, and how do you stay current with research?', 'Where do you see AI engineering evolving in the next 3-5 years?', 'What excites you most about our company\'s AI products?'] } },
  { role: 'Machine Learning Engineer', domain: 'Technology', sampleQuestions: { technical: ['Explain data parallelism vs model parallelism for training large models.', 'How do you handle feature store updates to prevent training-serving skew?', 'Describe your approach to model monitoring and drift detection in production.', 'What is the difference between batch and real-time inference architectures?'], behavioral: ['Tell me about a time you had to balance model accuracy with inference latency.', 'Describe how you handled a failed production model deployment.'], hr: ['How do you handle disagreements on model evaluation criteria with business stakeholders?', 'What motivates you about MLOps and production ML?'] } },
  { role: 'Data Scientist', domain: 'Technology', sampleQuestions: { technical: ['How does XGBoost handle missing values internally?', 'Explain the assumptions behind linear regression and when they are violated.', 'How would you design an A/B test for a new recommendation algorithm?', 'What is the difference between L1 and L2 regularization?'], behavioral: ['Tell me about a time you designed an A/B test and the results were inconclusive.', 'How do you translate statistical results for non-technical stakeholders?'], hr: ['How do you prioritize between multiple data science projects?', 'What is your approach to continuous learning in data science?'] } },
  { role: 'Data Analyst', domain: 'Technology', sampleQuestions: { technical: ['How would you handle a dataset with 30% missing values?', 'Explain the difference between INNER JOIN and LEFT JOIN.', 'How do you identify and handle outliers in a dataset?'], behavioral: ['Describe a time when your data analysis led to a significant business decision.', 'How do you handle conflicting data from different sources?'], hr: ['What tools do you prefer for data visualization and why?', 'How do you stay organized when working on multiple reports?'] } },
  { role: 'Full Stack Developer', domain: 'Technology', sampleQuestions: { technical: ['How do you design a secure API that handles real-time SSE for AI responses?', 'Explain the differences between server-side rendering and client-side rendering.', 'How would you optimize a React application with 1000+ components?', 'Describe your approach to database schema design for a multi-tenant SaaS.'], behavioral: ['Describe a complex frontend state issue you resolved using global state management.', 'Tell me about a time you had to refactor a legacy codebase.'], hr: ['What is your strategy for prioritizing features under tight deadlines?', 'How do you keep up with the fast-changing frontend ecosystem?'] } },
  { role: 'Frontend Developer', domain: 'Technology', sampleQuestions: { technical: ['Explain React Server Components and their benefits.', 'How do you optimize Core Web Vitals?', 'What is your approach to building accessible (WCAG) components?', 'Explain the virtual DOM and reconciliation process.'], behavioral: ['Tell me about a time you improved a website\'s performance significantly.', 'How do you handle pixel-perfect design implementation disagreements with designers?'], hr: ['What is your preferred frontend stack and why?', 'How do you approach learning new frontend frameworks?'] } },
  { role: 'Backend Developer', domain: 'Technology', sampleQuestions: { technical: ['How would you design a rate-limiting system for an API?', 'Explain event-driven architecture and when you would use it.', 'How do you handle database connection pooling in a microservices architecture?', 'What is the CAP theorem and how does it affect your design decisions?'], behavioral: ['Describe a time you debugged a complex production issue at scale.', 'How do you handle technical debt in backend systems?'], hr: ['What is your experience with different database paradigms?', 'How do you approach API versioning?'] } },
  { role: 'DevOps Engineer', domain: 'Technology', sampleQuestions: { technical: ['How do you implement a zero-downtime deployment strategy?', 'Explain the difference between Kubernetes StatefulSets and Deployments.', 'How would you design a CI/CD pipeline for a monorepo?', 'What is GitOps and how does it differ from traditional CD?'], behavioral: ['Tell me about a time you resolved a production outage under pressure.', 'How do you balance security with developer velocity?'], hr: ['What monitoring and alerting tools do you prefer and why?', 'How do you approach infrastructure cost optimization?'] } },
  { role: 'Cloud Engineer', domain: 'Technology', sampleQuestions: { technical: ['How would you design a multi-region disaster recovery strategy?', 'Explain the differences between AWS Lambda, ECS, and EKS.', 'How do you implement least-privilege access in cloud environments?'], behavioral: ['Describe a time you migrated a monolithic application to the cloud.', 'How do you handle unexpected cloud cost spikes?'], hr: ['Which cloud platform do you prefer and why?', 'How do you stay current with cloud service updates?'] } },
  { role: 'Cyber Security Analyst', domain: 'Technology', sampleQuestions: { technical: ['How would you respond to a suspected data breach?', 'Explain the MITRE ATT&CK framework and how you use it.', 'How do you conduct a vulnerability assessment?', 'What is Zero Trust Architecture and how would you implement it?'], behavioral: ['Describe a security incident you handled and the outcome.', 'How do you balance security controls with user experience?'], hr: ['What certifications do you hold and why are they important?', 'How do you stay updated on emerging threats?'] } },
  { role: 'Software Engineer', domain: 'Technology', sampleQuestions: { technical: ['Explain SOLID principles with examples.', 'How would you design a URL shortener system?', 'What is the time complexity of common sorting algorithms?', 'How do you approach writing testable code?'], behavioral: ['Tell me about a time you mentored a junior developer.', 'Describe a project where requirements changed mid-sprint.'], hr: ['What programming paradigm do you prefer and why?', 'How do you handle code reviews?'] } },
  { role: 'Mobile App Developer', domain: 'Technology', sampleQuestions: { technical: ['How do you handle offline-first data synchronization?', 'Explain the differences between React Native and Flutter.', 'How do you optimize mobile app startup time?'], behavioral: ['Describe a challenging mobile UX problem you solved.', 'How do you handle app store rejection?'], hr: ['What is your testing strategy for mobile apps?', 'How do you handle device fragmentation?'] } },
  { role: 'QA Engineer', domain: 'Technology', sampleQuestions: { technical: ['How do you design a test automation framework from scratch?', 'Explain the testing pyramid and your approach to each level.', 'How do you handle flaky tests in CI/CD pipelines?'], behavioral: ['Describe a critical bug you caught before production release.', 'How do you prioritize test cases when time is limited?'], hr: ['What is your preferred automation tool and why?', 'How do you handle conflicts with developers about bug severity?'] } },
  { role: 'Blockchain Developer', domain: 'Technology', sampleQuestions: { technical: ['Explain the difference between Proof of Work and Proof of Stake.', 'How do you prevent reentrancy attacks in Solidity?', 'What are the gas optimization techniques for smart contracts?'], behavioral: ['Describe a DeFi project you worked on and the challenges faced.', 'How do you handle smart contract audits?'], hr: ['What excites you about Web3 development?', 'How do you stay current with blockchain protocols?'] } },
  // ─── Business ──────────────────────────────
  { role: 'Business Analyst', domain: 'Business', sampleQuestions: { technical: ['How do you perform a gap analysis?', 'Explain your process for requirements gathering.', 'How do you create a business requirements document?'], behavioral: ['Tell me about a time you resolved conflicting stakeholder requirements.', 'Describe a project where your analysis significantly impacted business outcomes.'], hr: ['How do you prioritize competing business needs?', 'What tools do you use for process mapping?'], caseStudy: ['A retail company\'s online sales dropped 15% QoQ. Walk me through your analysis approach.', 'How would you evaluate the ROI of implementing a new CRM system?'] } },
  { role: 'Product Manager', domain: 'Business', sampleQuestions: { technical: ['How do you define and track product KPIs?', 'Explain your approach to product roadmap prioritization.', 'How do you use data to make product decisions?'], behavioral: ['Tell me about a time you had to say no to a stakeholder request.', 'Describe a product launch that didn\'t go as planned.'], hr: ['How do you balance user needs with business goals?', 'What is your product management philosophy?'], caseStudy: ['Design a feature to increase user retention by 20%. Walk me through your process.', 'How would you prioritize features for a new product with limited resources?'] } },
  { role: 'Project Manager', domain: 'Business', sampleQuestions: { technical: ['How do you create a project risk register?', 'Explain earned value management.', 'How do you handle scope creep?'], behavioral: ['Describe a project that was behind schedule. How did you recover?', 'Tell me about a time you managed a cross-functional team conflict.'], hr: ['What project management methodology do you prefer and why?', 'How do you handle stakeholder communication?'] } },
  { role: 'HR Manager', domain: 'Business', sampleQuestions: { technical: ['How do you design a performance management system?', 'Explain your approach to compensation benchmarking.', 'How do you measure employee engagement?'], behavioral: ['Describe a difficult termination you handled.', 'Tell me about a time you improved employee retention.'], hr: ['How do you stay current with employment law changes?', 'What is your approach to diversity and inclusion?'] } },
  { role: 'Operations Manager', domain: 'Business', sampleQuestions: { technical: ['How do you identify and eliminate operational bottlenecks?', 'Explain your approach to supply chain optimization.', 'How do you implement continuous improvement processes?'], behavioral: ['Describe a time you reduced operational costs significantly.', 'How do you handle a supply chain disruption?'], hr: ['What metrics do you use to measure operational efficiency?', 'How do you motivate teams during challenging periods?'] } },
  { role: 'Sales Manager', domain: 'Business', sampleQuestions: { technical: ['How do you build and manage a sales pipeline?', 'Explain your approach to territory planning.', 'How do you forecast sales revenue?'], behavioral: ['Describe a deal you lost and what you learned.', 'Tell me about your most challenging negotiation.'], hr: ['How do you motivate underperforming sales reps?', 'What CRM tools do you prefer and why?'] } },
  { role: 'Marketing Manager', domain: 'Business', sampleQuestions: { technical: ['How do you measure marketing ROI across channels?', 'Explain your approach to content marketing strategy.', 'How do you design a multi-channel marketing campaign?'], behavioral: ['Describe a marketing campaign that failed and what you learned.', 'How do you handle a brand crisis on social media?'], hr: ['How do you stay current with digital marketing trends?', 'What is your approach to marketing budget allocation?'] } },
  // ─── Finance ───────────────────────────────
  { role: 'Financial Analyst', domain: 'Finance', sampleQuestions: { technical: ['Walk me through a DCF model.', 'How do you perform comparable company analysis?', 'Explain the WACC formula and its components.'], behavioral: ['Describe a time your financial analysis influenced a major business decision.', 'How do you handle tight deadlines during earnings season?'], hr: ['What financial modeling tools do you use?', 'How do you stay current with market trends?'], caseStudy: ['Company X is considering acquiring Company Y for $500M. Walk me through your valuation approach.'] } },
  { role: 'Accountant', domain: 'Finance', sampleQuestions: { technical: ['Explain the difference between cash and accrual accounting.', 'How do you handle complex tax scenarios?', 'Walk me through the month-end close process.'], behavioral: ['Describe a time you discovered a significant accounting error.', 'How do you handle audit findings?'], hr: ['What accounting software do you prefer?', 'How do you stay current with GAAP updates?'] } },
  { role: 'Investment Banker', domain: 'Finance', sampleQuestions: { technical: ['Walk me through an LBO model.', 'How do you pitch an M&A deal to a client?', 'Explain the different types of debt financing.'], behavioral: ['Describe your most challenging deal and how you managed it.', 'How do you handle client pushback on valuation?'], hr: ['Why investment banking over other finance roles?', 'How do you handle work-life balance in banking?'], caseStudy: ['A tech startup wants to IPO. Walk me through the process and key considerations.'] } },
  { role: 'Auditor', domain: 'Finance', sampleQuestions: { technical: ['How do you assess internal controls?', 'Explain your approach to risk-based auditing.', 'How do you test for fraud?'], behavioral: ['Describe a time you identified a material misstatement.', 'How do you handle pushback from management on audit findings?'], hr: ['What is your approach to continuous auditing?', 'How do you handle confidential information?'] } },
  { role: 'Risk Analyst', domain: 'Finance', sampleQuestions: { technical: ['Explain Value at Risk (VaR) and its limitations.', 'How do you conduct stress testing?', 'What is the Basel III framework?'], behavioral: ['Describe a time you identified a risk that others overlooked.', 'How do you communicate risk to non-technical stakeholders?'], hr: ['What risk management tools do you use?', 'How do you stay current with regulatory changes?'] } },
  // ─── Design ────────────────────────────────
  { role: 'UI UX Designer', domain: 'Design', sampleQuestions: { technical: ['Walk me through your design process from research to delivery.', 'How do you conduct usability testing?', 'Explain your approach to design systems.'], behavioral: ['Describe a design that performed poorly in user testing and how you iterated.', 'How do you handle stakeholder feedback that conflicts with user research?'], hr: ['What design tools do you use and why?', 'How do you stay inspired and current with design trends?'] } },
  { role: 'Graphic Designer', domain: 'Design', sampleQuestions: { technical: ['Explain your approach to brand identity design.', 'How do you choose typography for a project?', 'What is your process for creating marketing collateral?'], behavioral: ['Describe a project where the client kept changing requirements.', 'How do you handle creative blocks?'], hr: ['What is your preferred design software?', 'How do you balance creativity with brand guidelines?'] } },
  { role: 'Product Designer', domain: 'Design', sampleQuestions: { technical: ['How do you use data to inform design decisions?', 'Explain your approach to design sprints.', 'How do you measure the success of a design?'], behavioral: ['Tell me about a product you redesigned and the impact it had.', 'How do you handle conflicting feedback from PMs and engineers?'], hr: ['What is your design philosophy?', 'How do you approach accessibility in design?'] } },
  { role: 'Motion Designer', domain: 'Design', sampleQuestions: { technical: ['Explain the 12 principles of animation.', 'How do you optimize animations for web performance?', 'What is your process for creating explainer videos?'], behavioral: ['Describe a project where animation significantly improved user engagement.', 'How do you handle tight turnaround times for motion projects?'], hr: ['What tools do you prefer for motion design?', 'How do you stay current with animation trends?'] } },
  // ─── Healthcare ────────────────────────────
  { role: 'Doctor', domain: 'Healthcare', sampleQuestions: { technical: ['Walk me through your approach to differential diagnosis.', 'How do you handle a patient presenting with multiple comorbidities?', 'Explain evidence-based medicine and how you apply it.'], behavioral: ['Describe a difficult patient interaction and how you handled it.', 'Tell me about a time you made a clinical error and what you learned.'], hr: ['Why did you choose your specialization?', 'How do you handle burnout in medicine?'] } },
  { role: 'Nurse', domain: 'Healthcare', sampleQuestions: { technical: ['How do you prioritize patient care with multiple critical patients?', 'Explain your approach to medication error prevention.', 'How do you handle a deteriorating patient?'], behavioral: ['Describe a time you advocated for a patient.', 'How do you handle a conflict with a physician?'], hr: ['What area of nursing are you most passionate about?', 'How do you handle the emotional challenges of nursing?'] } },
  { role: 'Pharmacist', domain: 'Healthcare', sampleQuestions: { technical: ['How do you identify and manage drug interactions?', 'Explain your approach to patient counseling.', 'How do you handle a prescription error?'], behavioral: ['Describe a time you caught a potentially dangerous prescription.', 'How do you handle a difficult patient?'], hr: ['What area of pharmacy interests you most?', 'How do you stay current with new medications?'] } },
  { role: 'Healthcare Administrator', domain: 'Healthcare', sampleQuestions: { technical: ['How do you manage hospital budgets effectively?', 'Explain your approach to regulatory compliance.', 'How do you improve patient satisfaction scores?'], behavioral: ['Describe a time you implemented a cost-saving initiative.', 'How do you handle staff shortages?'], hr: ['What healthcare management challenges excite you?', 'How do you balance quality of care with cost constraints?'] } },
  // ─── Education ─────────────────────────────
  { role: 'Teacher', domain: 'Education', sampleQuestions: { technical: ['How do you differentiate instruction for diverse learners?', 'Explain your approach to classroom management.', 'How do you assess student learning effectively?'], behavioral: ['Describe a time you helped a struggling student succeed.', 'How do you handle a disruptive student?'], hr: ['What teaching philosophy guides your practice?', 'How do you incorporate technology in the classroom?'] } },
  { role: 'Professor', domain: 'Education', sampleQuestions: { technical: ['Describe your research methodology.', 'How do you design a graduate-level course?', 'Explain your approach to mentoring doctoral students.'], behavioral: ['Describe a challenging research project and how you overcame obstacles.', 'How do you balance teaching, research, and service responsibilities?'], hr: ['What are your future research directions?', 'How do you approach interdisciplinary collaboration?'] } },
  { role: 'Academic Coordinator', domain: 'Education', sampleQuestions: { technical: ['How do you design an academic calendar?', 'Explain your approach to curriculum review.', 'How do you manage accreditation processes?'], behavioral: ['Describe a time you resolved a scheduling conflict.', 'How do you handle faculty concerns about curriculum changes?'], hr: ['What educational management tools do you use?', 'How do you stay current with education policy?'] } },
  // ─── Engineering ───────────────────────────
  { role: 'Mechanical Engineer', domain: 'Engineering', sampleQuestions: { technical: ['Explain the first and second laws of thermodynamics with practical applications.', 'How do you approach FEA for stress analysis?', 'Describe your experience with GD&T.'], behavioral: ['Tell me about a design that failed during testing and how you iterated.', 'How do you handle competing design constraints?'], hr: ['What CAD software are you most proficient in?', 'Where do you see mechanical engineering evolving?'] } },
  { role: 'Civil Engineer', domain: 'Engineering', sampleQuestions: { technical: ['How do you design a foundation for expansive soil conditions?', 'Explain your approach to structural load analysis.', 'How do you ensure compliance with building codes?'], behavioral: ['Describe a construction project that went over budget and how you handled it.', 'How do you manage subcontractors on a large project?'], hr: ['What project management tools do you use?', 'How do you approach sustainability in design?'] } },
  { role: 'Electrical Engineer', domain: 'Engineering', sampleQuestions: { technical: ['Explain the difference between AC and DC power systems.', 'How do you design a control system for an industrial process?', 'What is your approach to power system protection?'], behavioral: ['Describe a challenging electrical design problem you solved.', 'How do you handle safety concerns on a project?'], hr: ['What simulation tools do you prefer?', 'How do you stay current with electrical codes?'] } },
  { role: 'Electronics Engineer', domain: 'Engineering', sampleQuestions: { technical: ['How do you design a low-power IoT sensor node?', 'Explain your approach to PCB layout for high-speed signals.', 'How do you handle EMI/EMC compliance?'], behavioral: ['Describe a product you brought from prototype to production.', 'How do you debug intermittent hardware issues?'], hr: ['What microcontroller platforms do you prefer?', 'How do you approach hardware-software co-design?'] } },
  { role: 'Automobile Engineer', domain: 'Engineering', sampleQuestions: { technical: ['Explain the working of a hybrid powertrain.', 'How do you approach vehicle crashworthiness testing?', 'What is your experience with ADAS systems?'], behavioral: ['Describe a vehicle design challenge you solved innovatively.', 'How do you handle quality issues during mass production?'], hr: ['What excites you about EV technology?', 'How do you stay current with automotive standards?'] } },
  // ─── Media & Content ───────────────────────
  { role: 'Content Writer', domain: 'Media & Content', sampleQuestions: { technical: ['How do you optimize content for SEO?', 'Explain your content research process.', 'How do you maintain brand voice across different content types?'], behavioral: ['Describe a time your content significantly increased traffic.', 'How do you handle writer\'s block?'], hr: ['What content management tools do you prefer?', 'How do you measure content success?'] } },
  { role: 'Journalist', domain: 'Media & Content', sampleQuestions: { technical: ['How do you verify sources for a breaking story?', 'Explain your investigative reporting process.', 'How do you handle off-the-record information?'], behavioral: ['Describe a story where you faced ethical dilemmas.', 'How do you handle pressure from editors or advertisers?'], hr: ['What beat are you most passionate about?', 'How has journalism changed with digital media?'] } },
  { role: 'Copywriter', domain: 'Media & Content', sampleQuestions: { technical: ['How do you write a compelling CTA?', 'Explain your approach to A/B testing copy.', 'How do you adapt tone for different audiences?'], behavioral: ['Describe a campaign where your copy drove significant conversions.', 'How do you handle creative differences with clients?'], hr: ['What copywriting frameworks do you use?', 'How do you stay current with consumer psychology?'] } },
  { role: 'Video Editor', domain: 'Media & Content', sampleQuestions: { technical: ['How do you approach color grading for different moods?', 'Explain your workflow for editing a documentary.', 'How do you optimize video for different platforms?'], behavioral: ['Describe a project with a very tight turnaround time.', 'How do you handle client feedback that contradicts your creative vision?'], hr: ['What editing software do you prefer and why?', 'How do you stay current with video trends?'] } },
];

const interviewTypes = ['HR Interview', 'Technical Interview', 'Behavioral Interview', 'Case Study Interview', 'Mock Interview'] as const;
const experienceLevels = ['Fresher', 'Intern', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Manager'] as const;
const domainList = [...new Set(interviewRoles.map(r => r.domain))];

type InterviewType = typeof interviewTypes[number];
type ExperienceLevel = typeof experienceLevels[number];

// ═══════════════════════════════════════════════════════════════
// IDEAL ANSWER ENGINE — powered by real answer database
// ═══════════════════════════════════════════════════════════════

interface IdealAnswer {
  answer: string;
  keyPoints: string[];
  commonMistakes: string[];
  evaluationCriteria: string[];
  starBreakdown?: { situation: string; task: string; action: string; result: string };
}

// ── DB Lookup: match question text against answerDB keys ──
function lookupAnswerDB(question: string): { answer: string; keyPoints: string[]; mistakes: string[] } | null {
  const q = question.toLowerCase();
  for (const [key, entry] of Object.entries(answerDB)) {
    // Match if the question contains the DB key phrase
    if (q.includes(key)) return entry;
  }
  return null;
}

function generateIdealAnswer(question: string, role: string, level: ExperienceLevel): IdealAnswer {
  const q = question.toLowerCase();
  const isBehavioral = q.includes('describe a time') || q.includes('tell me about') || q.includes('give me an example') || q.includes('how do you handle');
  const isFresher = level === 'Fresher' || level === 'Intern';
  const isSenior = level === 'Senior' || level === 'Lead' || level === 'Manager';

  // ── Try answer DB lookup first ──
  const dbMatch = lookupAnswerDB(question);
  if (dbMatch) {
    return {
      answer: dbMatch.answer,
      keyPoints: dbMatch.keyPoints,
      commonMistakes: dbMatch.mistakes,
      evaluationCriteria: [
        'Technical accuracy and depth of explanation',
        'Use of relevant terminology and real-world examples',
        `Practical context for ${role} role`,
        isSenior ? 'Strategic thinking and architecture decisions' : 'Clarity and logical structure',
        'Mention of trade-offs and limitations'
      ]
    };
  }

  // ── Behavioral question — generate STAR answer ──
  if (isBehavioral) {
    return generateBehavioralAnswer(question, role, level);
  }

  // ── Technical / HR — generate substantive answer (no placeholders) ──
  return {
    answer: generateTechnicalAnswer(question, role, isSenior ? 'deep' : isFresher ? 'foundational' : 'moderate'),
    keyPoints: generateKeyPoints(question, role),
    commonMistakes: generateCommonMistakes(question, isFresher),
    evaluationCriteria: [
      'Technical accuracy and depth of explanation',
      'Use of relevant terminology and concepts',
      `Real-world examples from ${role} context`,
      isSenior ? 'Strategic thinking and architecture decisions' : 'Clarity and logical structure',
      'Mention of trade-offs and limitations'
    ]
  };
}

function generateBehavioralAnswer(question: string, role: string, level: ExperienceLevel): IdealAnswer {
  const q = question.toLowerCase();
  const isFresher = level === 'Fresher' || level === 'Intern';

  let situation = '', task = '', action = '', result = '';

  if (q.includes('challenge') || q.includes('difficult') || q.includes('conflict')) {
    situation = isFresher
      ? `During my final year capstone project as a ${role} student, our team faced a major disagreement on the technical approach.`
      : `At my previous company, our ${role} team encountered a critical production issue during a high-traffic period that affected 50K+ users.`;
    task = isFresher
      ? 'I needed to find a way to align the team and deliver the project by the deadline.'
      : 'I was responsible for diagnosing the root cause, coordinating the fix, and ensuring minimal customer impact.';
    action = isFresher
      ? 'I organized a structured brainstorming session, created a comparison matrix of approaches, and facilitated a vote. I also volunteered to prototype both options over a weekend.'
      : 'I immediately set up a war room, triaged the issue using logs and monitoring dashboards, identified a database connection pool exhaustion, implemented a hotfix with connection pooling limits, and communicated status updates to stakeholders every 30 minutes.';
    result = isFresher
      ? 'The team aligned on the best approach, we delivered on time, and our project received the highest grade in the cohort.'
      : 'We resolved the issue within 2 hours, implemented permanent fixes that reduced similar incidents by 90%, and I created a runbook that the team now uses as standard procedure.';
  } else if (q.includes('optimiz') || q.includes('improv') || q.includes('performance')) {
    situation = `While working as a ${role}, I noticed that a key system was performing significantly below expectations.`;
    task = 'I was tasked with identifying the bottleneck and improving performance to meet SLA requirements.';
    action = isFresher
      ? 'I profiled the application, identified N+1 query patterns, implemented batch processing, and added caching for frequently accessed data.'
      : 'I conducted a comprehensive performance audit, identified three bottlenecks (database queries, network latency, inefficient algorithms), implemented query optimization, added a caching layer with Redis, and refactored the critical path algorithm from O(n²) to O(n log n).';
    result = isFresher
      ? 'Response times improved by 45% and the system met all performance requirements.'
      : 'System throughput increased by 300%, p99 latency dropped from 2.5s to 200ms, and infrastructure costs were reduced by 35% due to fewer required instances.';
  } else if (q.includes('team') || q.includes('mentor') || q.includes('lead')) {
    situation = `In my role as a ${role}, I was responsible for a cross-functional initiative involving multiple team members.`;
    task = 'I needed to align diverse perspectives, maintain team morale, and deliver results on a tight timeline.';
    action = 'I established clear communication channels, created a shared project tracker, held weekly standups, provided mentorship to junior members, and ensured each person understood their contribution to the bigger picture.';
    result = 'The project was delivered 2 weeks ahead of schedule, team satisfaction scores improved by 25%, and two junior members were promoted within the next cycle based on their contributions.';
  } else {
    situation = `In my previous role as a ${role}, I encountered a significant professional situation that tested my skills.`;
    task = 'I was responsible for delivering a positive outcome while managing competing priorities and stakeholder expectations.';
    action = isFresher
      ? 'I broke the problem down into manageable parts, sought guidance from senior colleagues, researched best practices, and implemented a systematic solution with regular check-ins.'
      : 'I developed a structured approach: analyzed the situation data, identified root causes, consulted with cross-functional experts, implemented a phased solution, and established metrics to track progress.';
    result = isFresher
      ? 'The outcome exceeded expectations, I received positive feedback from my supervisor, and the approach I developed became a reference for future similar situations.'
      : 'The initiative resulted in measurable improvements across key metrics, earned recognition from leadership, and established a new best practice that was adopted organization-wide.';
  }

  return {
    answer: `**Situation:** ${situation}\n\n**Task:** ${task}\n\n**Action:** ${action}\n\n**Result:** ${result}`,
    keyPoints: [
      'Specific context with clear role description',
      'Measurable outcomes and concrete results',
      'Clear action steps showing personal contribution',
      'Reflection on learnings and impact',
      'STAR structure with logical flow'
    ],
    commonMistakes: [
      'Being too vague — "I worked with a team" without specifics',
      'Forgetting the Result — ending without measurable outcomes',
      'Taking all the credit — not acknowledging team contributions',
      'Using hypothetical "I would" instead of actual experiences',
      'Rambling without structure'
    ],
    evaluationCriteria: [
      'Complete STAR framework (Situation, Task, Action, Result)',
      'Specificity — names, numbers, timelines',
      'Personal contribution clearly articulated',
      'Measurable outcomes with data points',
      'Self-awareness and lessons learned'
    ],
    starBreakdown: { situation, task, action, result }
  };
}

function generateTechnicalAnswer(question: string, role: string, depth: string): string {
  // ── Try answer DB first for real substantive answers ──
  const dbMatch = lookupAnswerDB(question);
  if (dbMatch) return dbMatch.answer;

  const q = question.toLowerCase();
  // Fallback: generate contextual answers (no placeholders)
  if (q.includes('difference between') || q.includes('vs') || q.includes('compare')) {
    return `When comparing these concepts in a ${role} context, the key distinction lies in their underlying approach and use cases. The first concept prioritizes consistency and structure, making it ideal for production environments with strict requirements. The second concept favors flexibility and speed, better suited for rapid prototyping and smaller-scale applications. In practice, the choice depends on your specific constraints: team size, performance requirements, existing infrastructure, and long-term maintenance considerations. Most production systems I've worked with use a hybrid approach — leveraging the strengths of each where they matter most. The critical trade-off is usually between development speed and operational reliability.`;
  }
  if (q.includes('design') || q.includes('architect') || q.includes('build')) {
    return depth === 'deep'
      ? `I would approach this using a layered architecture: 1) **Requirements Analysis** — define functional and non-functional requirements, SLAs, and scale targets. 2) **High-Level Design** — choose between monolithic vs microservices based on team size and deployment needs. 3) **Data Layer** — select appropriate databases (SQL for ACID transactions, NoSQL for horizontal scale). 4) **API Design** — RESTful endpoints with proper versioning, rate limiting, authentication (JWT/OAuth2), and comprehensive error handling. 5) **Infrastructure** — containerized deployment with Kubernetes, auto-scaling based on CPU/memory metrics, and multi-region redundancy for high availability. 6) **Monitoring** — distributed tracing with OpenTelemetry, alerting with PagerDuty, and SLO dashboards in Grafana. Each decision would be documented with trade-off analysis and architecture decision records (ADRs).`
      : `I would start by understanding the requirements and constraints. Then design a clean architecture with separation of concerns, choose appropriate technologies based on the team's expertise and project needs, implement with best practices including comprehensive testing and documentation, and plan for scalability from day one. Key considerations include data modeling for query patterns, API design following RESTful conventions, robust error handling with meaningful error codes, and monitoring with alerting for proactive issue detection.`;
  }
  if (q.includes('explain') || q.includes('what is')) {
    return `This concept is fundamental to ${role} work. At its core, it provides a systematic approach to solving a specific category of problems by establishing clear patterns, interfaces, and best practices. Understanding it deeply means knowing not just what it does, but when to apply it and what alternatives exist. In production environments, the key considerations are performance implications, maintainability over time, and how it integrates with existing systems. Industry leaders typically implement it alongside complementary patterns to create robust, scalable solutions. The most common pitfall is over-engineering the implementation — start simple and evolve based on actual requirements.`;
  }
  if (q.includes('how do you') || q.includes('your approach')) {
    return `My approach follows a systematic methodology refined through practical experience: **First**, I assess the current state through data collection and stakeholder interviews to understand the problem deeply. **Second**, I research industry best practices and evaluate available tools and frameworks against our specific constraints. **Third**, I implement iteratively — starting with a minimal viable solution, then layering on complexity based on real feedback. **Fourth**, I measure results against predefined KPIs and adjust course as needed. **Fifth**, I document the approach and outcomes to build institutional knowledge. The key insight from my experience is that the best solutions emerge from balancing theoretical best practices with practical constraints like timeline, team capability, and budget.`;
  }

  return `As a ${role}, my approach to this starts with understanding the business context and technical constraints. I would evaluate the available options based on scalability, maintainability, and team expertise. For implementation, I follow industry best practices including thorough testing, code review, documentation, and incremental delivery. The critical success factors are clear communication with stakeholders, measurable outcomes tied to business objectives, and continuous improvement through retrospectives. In my experience, the most effective solutions come from combining technical excellence with pragmatic decision-making.`;
}

function generateKeyPoints(question: string, role: string): string[] {
  // ── Try answer DB for real key points ──
  const dbMatch = lookupAnswerDB(question);
  if (dbMatch) return dbMatch.keyPoints;

  const q = question.toLowerCase();
  const points: string[] = [];
  points.push('Clear, structured definition or explanation');
  if (q.includes('design') || q.includes('architect')) {
    points.push('Scalability and performance considerations');
    points.push('Technology choices with justification');
    points.push('Trade-off analysis');
  }
  if (q.includes('explain') || q.includes('what is') || q.includes('difference')) {
    points.push('Core concepts and principles');
    points.push('Practical applications and examples');
    points.push('Advantages and limitations');
  }
  points.push(`Real-world relevance to ${role} work`);
  points.push('Industry best practices mentioned');
  if (points.length < 4) points.push('Concrete examples from experience');
  return points.slice(0, 5);
}

function generateCommonMistakes(question: string, isFresher: boolean): string[] {
  // ── Try answer DB for real mistakes ──
  const dbMatch = lookupAnswerDB(question);
  if (dbMatch) return dbMatch.mistakes;

  return [
    'Giving a textbook definition without practical context',
    'Not mentioning trade-offs or limitations',
    'Being too vague — missing specific tools, numbers, or examples',
    'Confusing related but different concepts',
    isFresher ? 'Saying "I don\'t have experience" instead of relating to academic projects' : 'Not demonstrating depth expected at this experience level'
  ];
}

// ═══════════════════════════════════════════════════════════════
// INTENT DETECTION — for Learning Mode
// ═══════════════════════════════════════════════════════════════

type UserIntent = 'greeting' | 'learning_question' | 'acknowledgment' | 'interview_request' | 'follow_up';

function detectIntent(text: string): UserIntent {
  const q = text.toLowerCase().trim();
  const words = q.split(/\s+/);

  // Greeting
  if (/^(h+i+|h+e+y+|he+llo+|yo+|sup|what'?s?\s*up|good\s*(morning|evening|afternoon)|howdy|greetings)/i.test(q) && words.length <= 5) {
    return 'greeting';
  }
  // Acknowledgment / small talk
  if (/^(thanks?|thank\s*you|ok|cool|nice|great|got\s*it|awesome|perfect|sure|alright|yes|no|yep|yeah|nah|nope|hmm)/i.test(q) && words.length <= 4) {
    return 'acknowledgment';
  }
  // Interview request
  if (/\b(interview|mock\s*interview|practice\s*question|interview\s*prep|ask\s+me)\b/i.test(q)) {
    return 'interview_request';
  }
  // Learning / knowledge question
  if (/^(what\s+is|explain|describe|define|how\s+does|how\s+do|what\s+are|tell\s+me\s+about|teach\s+me|how\s+to|why\s+is|why\s+do|when\s+to|can\s+you\s+explain|walk\s+me\s+through|what's|whats)/i.test(q) || /\b(difference\s+between|vs\.?|versus|compare)\b/i.test(q)) {
    return 'learning_question';
  }
  // If 4+ words, likely a question
  if (words.length >= 4) return 'learning_question';

  return 'follow_up';
}


// Chat message types
interface ChatMessage {
  id: string;
  sender: 'interviewer' | 'user';
  text: string;
  timestamp: Date;
  scores?: { technical: number; confidence: number; communication: number; problemSolving: number };
  feedback?: string;
  suggestedAnswer?: string;
  idealAnswer?: IdealAnswer;
  isQuestion?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export const InterviewAssistant: React.FC = () => {
  const { userProfile, updateUserProfile, apiSettings } = useStore();

  // Setup state
  const [selectedRole, setSelectedRole] = useState(userProfile.targetRole || 'AI Engineer');
  const [selectedType, setSelectedType] = useState<InterviewType>('Technical Interview');
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>('Mid-Level');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [domainFilter, setDomainFilter] = useState('All');
  const [learningMode, setLearningMode] = useState(false);

  // Interview state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [maxQuestions] = useState(5);
  const [finished, setFinished] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Filtered roles
  const filteredRoles = useMemo(() => {
    let list = interviewRoles;
    if (domainFilter !== 'All') list = list.filter(r => r.domain === domainFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.role.toLowerCase().includes(q) || r.domain.toLowerCase().includes(q));
    }
    return list;
  }, [domainFilter, searchQuery]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, expandedAnswers]);

  // Toggle answer panel
  const toggleAnswer = (msgId: string) => {
    setExpandedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  // Get a fresh question that hasn't been asked
  const getNextQuestion = (): string => {
    const roleData = interviewRoles.find(r => r.role === selectedRole);
    if (!roleData) return 'Tell me about yourself and your experience.';

    let pool: string[] = [];
    if (selectedType === 'Technical Interview') pool = roleData.sampleQuestions.technical;
    else if (selectedType === 'Behavioral Interview') pool = roleData.sampleQuestions.behavioral;
    else if (selectedType === 'HR Interview') pool = roleData.sampleQuestions.hr;
    else if (selectedType === 'Case Study Interview') pool = [...(roleData.sampleQuestions.caseStudy || []), ...roleData.sampleQuestions.behavioral];
    else pool = [...roleData.sampleQuestions.technical, ...roleData.sampleQuestions.behavioral, ...roleData.sampleQuestions.hr];

    const fresh = pool.filter(q => !askedQuestions.has(q));
    if (fresh.length === 0) return pool[Math.floor(Math.random() * pool.length)];

    const question = fresh[Math.floor(Math.random() * fresh.length)];
    setAskedQuestions(prev => new Set([...prev, question]));
    return question;
  };

  const getLevelPrefix = (): string => {
    if (selectedLevel === 'Fresher' || selectedLevel === 'Intern') return 'As someone starting your career, ';
    if (selectedLevel === 'Senior' || selectedLevel === 'Lead') return 'Given your senior experience, ';
    if (selectedLevel === 'Manager') return 'As a leader in this field, ';
    return '';
  };

  // Start interview
  const startInterview = () => {
    const roleData = interviewRoles.find(r => r.role === selectedRole);
    const domain = roleData?.domain || 'Technology';
    const resumeContext = userProfile.resumeUploaded
      ? `\n\nI've reviewed your profile — I see you have experience with ${userProfile.skills.slice(0, 4).join(', ')}.`
      : '';

    if (learningMode) {
      // ── LEARNING MODE: Open chat — no forced questions ──
      const greeting: ChatMessage = {
        id: Date.now().toString(),
        sender: 'interviewer',
        text: `Hey! 👋 I'm your AI learning assistant for **${selectedRole}** (${domain}).${resumeContext}\n\nI can help you with:\n• **Learn concepts** — "What is Machine Learning?", "Explain Docker"\n• **Interview prep** — "Give me interview questions"\n• **Compare technologies** — "SQL vs NoSQL"\n• **Career guidance** — "How to become a ${selectedRole}?"\n\nAsk me anything!`,
        timestamp: new Date(),
      };
      setMessages([greeting]);
      setQuestionCount(0);
      setInterviewStarted(true);
      setFinished(false);
      setExpandedAnswers(new Set());
      return;
    }

    // ── INTERVIEW MODE: Standard question flow ──
    const greeting: ChatMessage = {
      id: Date.now().toString(),
      sender: 'interviewer',
      text: `Welcome! I'm your ${selectedType.replace(' Interview', '')} interviewer for the **${selectedRole}** role in ${domain}.${resumeContext}\n\nThis will be a ${maxQuestions}-question session tailored for **${selectedLevel}** level.\n\nLet's begin.`,
      timestamp: new Date(),
    };

    const firstQ = getNextQuestion();
    const questionText = `${getLevelPrefix()}${firstQ}`;
    const idealAns = generateIdealAnswer(firstQ, selectedRole, selectedLevel);

    const firstQuestion: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'interviewer',
      text: questionText,
      timestamp: new Date(),
      isQuestion: true,
      idealAnswer: idealAns,
    };

    setMessages([greeting, firstQuestion]);
    setQuestionCount(1);
    setInterviewStarted(true);
    setFinished(false);
    setExpandedAnswers(new Set());
  };

  // Submit user message
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userInput.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setLoading(true);

    try {
      const gemini = getGeminiClient(apiSettings.geminiKey, apiSettings.isSimulator);

      // ═══════════════════════════════════════
      //  LEARNING MODE — ChatGPT-style responses
      // ═══════════════════════════════════════
      if (learningMode) {
        const intent = detectIntent(userInput.trim());

        if (intent === 'interview_request') {
          // User wants interview practice in Learning Mode — switch to Q&A
          const nextQ = getNextQuestion();
          const questionText = `Sure! Let me ask you an interview question:\n\n${getLevelPrefix()}${nextQ}`;
          const idealAns = generateIdealAnswer(nextQ, selectedRole, selectedLevel);

          const questionMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'interviewer',
            text: questionText,
            timestamp: new Date(),
            isQuestion: true,
            idealAnswer: idealAns,
          };
          setMessages(prev => [...prev, questionMsg]);
          setExpandedAnswers(prev => new Set([...prev, (Date.now() + 1).toString()]));
        } else {
          // Knowledge question / greeting / follow-up — use AI tutor
          const history = messages.map(m => ({ sender: m.sender === 'interviewer' ? 'ai' : 'user', text: m.text }));
          const result = await gemini.chatLearningAssistant(userInput.trim(), selectedRole, selectedLevel, history);

          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'interviewer',
            text: result.answer,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiResponse]);
        }

        setLoading(false);
        inputRef.current?.focus();
        return;
      }

      // ═══════════════════════════════════════
      //  INTERVIEW MODE — Evaluate + Score + Next
      // ═══════════════════════════════════════
      const lastInterviewerMsg = [...messages].reverse().find(m => m.sender === 'interviewer');
      const evalResult = await gemini.evaluateAnswer(lastInterviewerMsg?.text || '', userInput.trim());

      const feedbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'interviewer',
        text: evalResult.feedback,
        timestamp: new Date(),
        scores: {
          technical: evalResult.technicalScore,
          confidence: evalResult.confidenceScore,
          communication: evalResult.communicationScore,
          problemSolving: Math.round((evalResult.technicalScore + evalResult.confidenceScore) / 2),
        },
        feedback: evalResult.feedback,
        suggestedAnswer: evalResult.suggestedAnswer,
      };

      if (questionCount >= maxQuestions) {
        setMessages(prev => [...prev, feedbackMsg]);

        const allScores = [...messages, userMsg, feedbackMsg].filter(m => m.scores);
        allScores.push(feedbackMsg);
        const count = allScores.length;
        const avg = (key: keyof NonNullable<ChatMessage['scores']>) =>
          Math.round(allScores.reduce((sum, m) => sum + (m.scores?.[key] || 0), 0) / Math.max(count, 1));

        updateUserProfile({
          technicalScore: avg('technical'),
          confidenceScore: avg('confidence'),
          communicationScore: avg('communication'),
        });

        setTimeout(() => setFinished(true), 500);
      } else {
        const nextQ = getNextQuestion();
        const questionText = `${getLevelPrefix()}${nextQ}`;
        const idealAns = generateIdealAnswer(nextQ, selectedRole, selectedLevel);

        const nextQuestion: ChatMessage = {
          id: (Date.now() + 2).toString(),
          sender: 'interviewer',
          text: questionText,
          timestamp: new Date(),
          isQuestion: true,
          idealAnswer: idealAns,
        };

        setMessages(prev => [...prev, feedbackMsg, nextQuestion]);
        setQuestionCount(prev => prev + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Compute session stats
  const sessionScores = useMemo(() => {
    const scored = messages.filter(m => m.scores);
    if (scored.length === 0) return null;
    const avg = (key: keyof NonNullable<ChatMessage['scores']>) =>
      Math.round(scored.reduce((sum, m) => sum + (m.scores?.[key] || 0), 0) / scored.length);
    const overall = Math.round((avg('technical') + avg('confidence') + avg('communication') + avg('problemSolving')) / 4);
    return { technical: avg('technical'), confidence: avg('confidence'), communication: avg('communication'), problemSolving: avg('problemSolving'), overall };
  }, [messages]);

  const selectedRoleData = interviewRoles.find(r => r.role === selectedRole);

  const ScoreBar: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-brand-silver font-medium">{label}</span>
        <span className="text-white font-bold">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  // Ideal Answer Card Component
  const IdealAnswerCard: React.FC<{ idealAnswer: IdealAnswer; msgId: string }> = ({ idealAnswer, msgId }) => {
    const isExpanded = expandedAnswers.has(msgId);
    return (
      <div className="mt-2">
        <button
          onClick={() => toggleAnswer(msgId)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
            isExpanded
              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
              : 'bg-brand-indigo/10 border border-brand-indigo/20 text-brand-cyan hover:bg-brand-indigo/20'
          }`}
        >
          {isExpanded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {isExpanded ? 'Hide Sample Answer' : 'Show Sample Answer'}
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-2 animate-in slide-in-from-top-2">
            {/* Ideal Answer */}
            <div className="p-3 rounded-xl bg-brand-indigo/5 border border-brand-indigo/15">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="h-3 w-3 text-brand-cyan" />
                <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider">Ideal Answer</span>
              </div>
              <div className="text-[11px] text-brand-silver leading-relaxed whitespace-pre-line">{idealAnswer.answer}</div>
            </div>

            {/* STAR Breakdown */}
            {idealAnswer.starBreakdown && (
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/15">
                <div className="flex items-center gap-1.5 mb-2">
                  <Star className="h-3 w-3 text-purple-400" />
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">STAR Breakdown</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {Object.entries(idealAnswer.starBreakdown).map(([key, val]) => (
                    <div key={key} className="flex gap-2 text-[10px]">
                      <span className="font-bold text-purple-300 capitalize min-w-[60px]">{key}:</span>
                      <span className="text-brand-silver">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Points */}
            <div className="p-3 rounded-xl bg-brand-success/5 border border-brand-success/15">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="h-3 w-3 text-brand-success" />
                <span className="text-[10px] font-bold text-brand-success uppercase tracking-wider">Key Points Expected</span>
              </div>
              <div className="space-y-1">
                {idealAnswer.keyPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[10px] text-brand-silver">
                    <CheckCircle2 className="h-3 w-3 text-brand-success shrink-0 mt-0.5" />
                    {pt}
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes & Evaluation side by side */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-3 w-3 text-red-400" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Common Mistakes</span>
                </div>
                <div className="space-y-1">
                  {idealAnswer.commonMistakes.map((m, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10px] text-brand-silver">
                      <span className="text-red-400 shrink-0">✗</span>{m}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                <div className="flex items-center gap-1.5 mb-2">
                  <ListChecks className="h-3 w-3 text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Evaluation Criteria</span>
                </div>
                <div className="space-y-1">
                  {idealAnswer.evaluationCriteria.map((c, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10px] text-brand-silver">
                      <span className="text-blue-400 shrink-0">◉</span>{c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo bottom-10 left-10 animate-pulse-slow"></div>
      <div className="glow-orb-cyan top-10 right-10 animate-pulse-slow"></div>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-white">AI Interview & Learning Hub</h1>
            <p className="text-brand-silver text-sm mt-1">
              Interview practice + AI tutor across {interviewRoles.length}+ careers. Ask anything or start a mock interview.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 text-[10px] font-bold text-brand-cyan">
              {interviewRoles.length} Roles
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400">
              Dual Mode
            </div>
          </div>
        </div>

        {/* ── SETUP PANEL ── */}
        {!interviewStarted && (
          <div className="space-y-6">
            <GlassCard>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-silver mb-1.5">Industry</label>
                  <select
                    value={domainFilter}
                    onChange={(e) => { setDomainFilter(e.target.value); setShowDropdown(true); }}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-brand-cyan transition font-semibold"
                  >
                    <option value="All">All Industries</option>
                    {domainList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="relative lg:col-span-2">
                  <label className="block text-xs font-semibold text-brand-silver mb-1.5">Target Role</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-silver" />
                    <input
                      type="text"
                      value={showDropdown ? searchQuery : selectedRole}
                      onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search roles..."
                      className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-8 py-3 text-xs text-white outline-none focus:border-brand-cyan transition font-semibold"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-silver" />
                  </div>
                  {showDropdown && (
                    <div className="absolute z-30 top-full mt-1 w-full max-h-52 overflow-y-auto bg-brand-dark border border-brand-border rounded-xl shadow-2xl">
                      {filteredRoles.map(r => (
                        <button key={r.role} onClick={() => { setSelectedRole(r.role); setShowDropdown(false); setSearchQuery(''); }}
                          className={`w-full text-left px-4 py-2.5 text-xs hover:bg-white/5 transition flex items-center justify-between ${r.role === selectedRole ? 'bg-brand-indigo/10 text-brand-cyan' : 'text-white'}`}>
                          <span className="font-semibold">{r.role}</span>
                          <span className="text-[10px] text-brand-silver px-2 py-0.5 rounded bg-white/5">{r.domain}</span>
                        </button>
                      ))}
                      {filteredRoles.length === 0 && <div className="px-4 py-6 text-xs text-brand-silver text-center">No matching roles.</div>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-silver mb-1.5">Level</label>
                  <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value as ExperienceLevel)}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-brand-cyan transition font-semibold">
                    {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Interview type selector */}
              <div className="mt-4 pt-4 border-t border-brand-border">
                <label className="block text-xs font-semibold text-brand-silver mb-2">Interview Type</label>
                <div className="flex flex-wrap gap-2">
                  {interviewTypes.map(t => (
                    <button key={t} onClick={() => setSelectedType(t)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${selectedType === t ? 'border-brand-cyan bg-brand-cyan/10 text-white' : 'border-white/10 text-brand-silver hover:bg-white/5'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Mode Toggle */}
              <div className="mt-4 pt-4 border-t border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Learning Mode</div>
                    <div className="text-[10px] text-brand-silver">Show ideal answers, key points, and evaluation criteria for each question</div>
                  </div>
                </div>
                <button
                  onClick={() => setLearningMode(!learningMode)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${learningMode ? 'bg-amber-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${learningMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Selected role preview */}
              {selectedRoleData && (
                <div className="mt-4 pt-3 border-t border-brand-border flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] text-brand-silver font-semibold uppercase tracking-wider">Ready:</span>
                  <span className="text-xs font-bold text-white">{selectedRoleData.role}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-indigo/10 border border-brand-indigo/20 text-brand-cyan">{selectedRoleData.domain}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 border border-white/10 text-brand-silver">{selectedLevel}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-success/10 border border-brand-success/20 text-brand-success">{selectedType}</span>
                  {learningMode && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">📖 Learning</span>}
                </div>
              )}
            </GlassCard>

            {/* Start buttons */}
            <div className="text-center flex justify-center gap-3">
              <button onClick={() => { setLearningMode(false); startInterview(); }}
                className="px-8 py-4 rounded-xl bg-brand-indigo hover:bg-brand-indigo/80 text-white font-bold text-sm transition shadow-[0_0_20px_rgba(63,78,255,0.4)] inline-flex items-center gap-2">
                <Video className="h-5 w-5" />
                Start Interview
              </button>
              <button onClick={() => { setLearningMode(true); startInterview(); }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-400 font-bold text-sm transition inline-flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Sparkles className="h-5 w-5" />
                Start AI Learning Mode
              </button>
            </div>
          </div>
        )}

        {/* ── INTERVIEW IN PROGRESS ── */}
        {interviewStarted && !finished && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <GlassCard className="p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${learningMode ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-brand-indigo/20 border border-brand-indigo/40'}`}>
                      {learningMode ? <GraduationCap className="h-3.5 w-3.5 text-amber-400" /> : <Bot className="h-3.5 w-3.5 text-brand-cyan" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{learningMode ? `${selectedRole} AI Tutor` : `${selectedRole} Interviewer`}</div>
                      <div className="text-[10px] text-brand-silver">{learningMode ? 'Ask anything • Learn concepts • Interview prep' : `${selectedType} • ${selectedLevel}`}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {learningMode ? (
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> AI Tutor</span>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold text-brand-silver">Q{questionCount}/{maxQuestions}</span>
                        <div className="h-1.5 w-20 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-cyan rounded-full transition-all" style={{ width: `${(questionCount / maxQuestions) * 100}%` }} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="h-[450px] overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id}>
                      <div className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'interviewer' ? 'bg-brand-indigo/20 border border-brand-indigo/40' : 'bg-brand-cyan/20 border border-brand-cyan/40'}`}>
                          {msg.sender === 'interviewer' ? <Bot className="h-3.5 w-3.5 text-brand-cyan" /> : <User className="h-3.5 w-3.5 text-brand-cyan" />}
                        </div>
                        <div className="max-w-[80%] space-y-2">
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === 'interviewer' ? 'bg-white/5 border border-white/10 text-white rounded-tl-sm' : 'bg-brand-indigo/20 border border-brand-indigo/30 text-white rounded-tr-sm'}`}>
                            {msg.text}
                          </div>
                          {/* Scores */}
                          {msg.scores && (
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: 'Tech', value: msg.scores.technical, color: 'text-brand-cyan' },
                                { label: 'Comm', value: msg.scores.communication, color: 'text-brand-indigo' },
                                { label: 'Conf', value: msg.scores.confidence, color: 'text-brand-success' },
                              ].map((s, i) => (
                                <span key={i} className={`px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 border border-white/10 ${s.color}`}>
                                  {s.label}: {s.value}%
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Model answer from evaluation */}
                          {msg.suggestedAnswer && (
                            <details className="text-[10px]">
                              <summary className="text-brand-cyan cursor-pointer hover:underline font-semibold">View model answer</summary>
                              <p className="mt-1 p-2 rounded bg-white/5 border border-white/10 text-brand-silver italic">{msg.suggestedAnswer}</p>
                            </details>
                          )}
                          {/* Ideal Answer Card for question messages */}
                          {msg.isQuestion && msg.idealAnswer && (
                            <IdealAnswerCard idealAnswer={msg.idealAnswer} msgId={msg.id} />
                          )}
                          <div className="text-[9px] text-brand-silver/50">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="h-7 w-7 rounded-full bg-brand-indigo/20 border border-brand-indigo/40 flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5 text-brand-cyan" />
                      </div>
                      <div className="p-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10">
                        <div className="flex gap-1"><span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-bounce" /><span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '0.15s' }} /><span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '0.3s' }} /></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmitAnswer} className="border-t border-brand-border p-3 flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitAnswer(e); } }}
                    placeholder={learningMode ? 'Ask me anything... (What is ML? Explain Docker? How does React work?)' : 'Type your answer... (Enter to send, Shift+Enter for new line)'}
                    rows={2}
                    className={`flex-1 bg-brand-dark border rounded-xl px-4 py-2 text-xs text-white outline-none transition resize-none ${learningMode ? 'border-amber-500/20 focus:border-amber-400' : 'border-brand-border focus:border-brand-cyan'}`}
                  />
                  <button type="submit" disabled={loading || !userInput.trim()}
                    className={`px-4 rounded-xl disabled:opacity-40 text-white transition shrink-0 ${learningMode ? 'bg-amber-500 hover:bg-amber-500/80' : 'bg-brand-indigo hover:bg-brand-indigo/80'}`}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>
              </GlassCard>
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              {learningMode ? (
                /* ── LEARNING MODE side panel ── */
                <>
                  <GlassCard className="space-y-3">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" /> AI Tutor Mode
                    </h3>
                    <div className="text-[10px] text-brand-silver space-y-2">
                      <p>I can help you with:</p>
                      <div className="space-y-1.5">
                        {[
                          { icon: '📚', label: 'Learn Concepts', hint: '"What is Docker?"' },
                          { icon: '💡', label: 'Explain Topics', hint: '"Explain neural networks"' },
                          { icon: '🎯', label: 'Interview Prep', hint: '"Ask me questions"' },
                          { icon: '⚡', label: 'Compare Tech', hint: '"SQL vs NoSQL"' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/3 border border-white/5">
                            <span className="text-sm">{item.icon}</span>
                            <div>
                              <div className="text-[10px] font-bold text-white">{item.label}</div>
                              <div className="text-[9px] text-brand-silver italic">{item.hint}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="space-y-2">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-amber-400" /> Conversation
                    </h3>
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between"><span className="text-brand-silver">Role</span><span className="text-white font-bold">{selectedRole}</span></div>
                      <div className="flex justify-between"><span className="text-brand-silver">Level</span><span className="text-white font-bold">{selectedLevel}</span></div>
                      <div className="flex justify-between"><span className="text-brand-silver">Messages</span><span className="text-white font-bold">{messages.length}</span></div>
                      <div className="flex justify-between"><span className="text-brand-silver">Mode</span><span className="font-bold text-amber-400">✨ AI Tutor</span></div>
                    </div>
                  </GlassCard>
                </>
              ) : (
                /* ── INTERVIEW MODE side panel ── */
                <>
                  <GlassCard className="space-y-3">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-brand-cyan" /> Live Score
                    </h3>
                    {sessionScores ? (
                      <div className="space-y-2">
                        <ScoreBar value={sessionScores.technical} label="Technical" color="bg-brand-cyan" />
                        <ScoreBar value={sessionScores.communication} label="Communication" color="bg-brand-indigo" />
                        <ScoreBar value={sessionScores.confidence} label="Confidence" color="bg-brand-success" />
                        <ScoreBar value={sessionScores.problemSolving} label="Problem Solving" color="bg-pink-500" />
                        <div className="pt-2 border-t border-brand-border text-center">
                          <div className="text-2xl font-extrabold font-display text-white">{sessionScores.overall}%</div>
                          <div className="text-[10px] text-brand-silver">Overall</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-brand-silver text-center py-4">Answer questions to see live scores</div>
                    )}
                  </GlassCard>

                  <GlassCard className="space-y-2">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-brand-silver" /> Session Info
                    </h3>
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between"><span className="text-brand-silver">Role</span><span className="text-white font-bold">{selectedRole}</span></div>
                      <div className="flex justify-between"><span className="text-brand-silver">Type</span><span className="text-white font-bold">{selectedType.replace(' Interview', '')}</span></div>
                      <div className="flex justify-between"><span className="text-brand-silver">Level</span><span className="text-white font-bold">{selectedLevel}</span></div>
                      <div className="flex justify-between"><span className="text-brand-silver">Progress</span><span className="text-white font-bold">{questionCount}/{maxQuestions}</span></div>
                      <div className="flex justify-between"><span className="text-brand-silver">Mode</span><span className="text-white font-bold">🎯 Interview</span></div>
                    </div>
                  </GlassCard>
                </>
              )}

              <button onClick={() => { setInterviewStarted(false); setMessages([]); setQuestionCount(0); setAskedQuestions(new Set()); setExpandedAnswers(new Set()); }}
                className="w-full py-2 border border-white/10 text-brand-silver hover:text-white rounded-lg text-xs font-semibold hover:bg-white/5 transition">
                End Session
              </button>
            </div>
          </div>
        )}

        {/* ── SESSION COMPLETE ── */}
        {finished && sessionScores && (
          <div className="space-y-6">
            <GlassCard className="text-center py-10 space-y-6">
              <div className="p-4 rounded-full bg-brand-success/10 text-brand-success border border-brand-success/20 inline-block">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Interview Complete!</h2>
                <p className="text-brand-silver text-xs mt-1">{selectedRole} • {selectedType} • {selectedLevel} Level</p>
              </div>

              <div className="relative inline-flex items-center justify-center">
                <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke={sessionScores.overall >= 70 ? '#10B981' : sessionScores.overall >= 40 ? '#F59E0B' : '#EF4444'} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${sessionScores.overall * 3.27} 327`} />
                </svg>
                <div className="absolute">
                  <div className="text-3xl font-extrabold font-display text-white">{sessionScores.overall}%</div>
                  <div className="text-[9px] text-brand-silver font-semibold">OVERALL</div>
                </div>
              </div>
            </GlassCard>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Technical', value: sessionScores.technical, icon: <Zap className="h-4 w-4" />, color: 'text-brand-cyan' },
                { label: 'Communication', value: sessionScores.communication, icon: <MessageSquare className="h-4 w-4" />, color: 'text-brand-indigo' },
                { label: 'Confidence', value: sessionScores.confidence, icon: <Shield className="h-4 w-4" />, color: 'text-brand-success' },
                { label: 'Problem Solving', value: sessionScores.problemSolving, icon: <Target className="h-4 w-4" />, color: 'text-pink-500' },
              ].map((s, i) => (
                <GlassCard key={i} className="text-center space-y-2">
                  <div className={`mx-auto ${s.color}`}>{s.icon}</div>
                  <div className={`text-2xl font-extrabold font-display ${s.color}`}>{s.value}%</div>
                  <div className="text-[10px] text-brand-silver font-semibold uppercase tracking-wider">{s.label}</div>
                </GlassCard>
              ))}
            </div>

            <GlassCard className="space-y-3">
              <div className="flex items-center gap-2 border-b border-brand-border pb-2">
                <Award className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold text-white">Hiring Recommendation</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  sessionScores.overall >= 80 ? 'bg-brand-success/10 border border-brand-success/20 text-brand-success' :
                  sessionScores.overall >= 60 ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' :
                  'bg-brand-error/10 border border-brand-error/20 text-brand-error'
                }`}>
                  {sessionScores.overall >= 80 ? '✅ Strong Hire' : sessionScores.overall >= 60 ? '🟡 Consider with Reservations' : '🔴 Not Ready — More Practice Needed'}
                </div>
                <div className="text-[10px] text-brand-silver flex-1">
                  {sessionScores.overall >= 80 ? 'Demonstrated strong competency across all dimensions.' :
                   sessionScores.overall >= 60 ? 'Shows potential but needs improvement in some areas.' :
                   'Significant gaps identified — focus on the learning path below.'}
                </div>
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard className="space-y-3">
                <div className="flex items-center gap-2"><Star className="h-4 w-4 text-brand-success" /><h3 className="text-xs font-bold text-white">Strengths</h3></div>
                <div className="space-y-1.5 text-xs text-brand-silver">
                  {sessionScores.technical >= 70 && <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-brand-success" /> Strong technical knowledge</div>}
                  {sessionScores.communication >= 70 && <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-brand-success" /> Clear communication</div>}
                  {sessionScores.confidence >= 70 && <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-brand-success" /> Confident delivery</div>}
                  {sessionScores.problemSolving >= 70 && <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-brand-success" /> Good problem-solving approach</div>}
                  {sessionScores.overall < 70 && <div>Keep practicing — strengths will emerge!</div>}
                </div>
              </GlassCard>
              <GlassCard className="space-y-3">
                <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-amber-500" /><h3 className="text-xs font-bold text-white">Areas for Improvement</h3></div>
                <div className="space-y-1.5 text-xs text-brand-silver">
                  {sessionScores.technical < 70 && <div className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 text-amber-500" /> Deepen technical expertise</div>}
                  {sessionScores.communication < 70 && <div className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 text-amber-500" /> Structure answers more clearly (STAR method)</div>}
                  {sessionScores.confidence < 70 && <div className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 text-amber-500" /> Provide more specific examples</div>}
                  {sessionScores.problemSolving < 70 && <div className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 text-amber-500" /> Practice structured problem decomposition</div>}
                  {sessionScores.overall >= 70 && <div>Minor polish needed — you're almost there!</div>}
                </div>
              </GlassCard>
            </div>

            <div className="flex justify-center gap-3">
              <button onClick={() => { setInterviewStarted(false); setMessages([]); setQuestionCount(0); setFinished(false); setAskedQuestions(new Set()); setExpandedAnswers(new Set()); }}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-bold text-xs hover:bg-white/5 transition">
                New Interview
              </button>
              <button onClick={() => { setFinished(false); startInterview(); }}
                className="px-5 py-2.5 rounded-xl bg-brand-indigo text-white font-bold text-xs hover:bg-brand-indigo/80 transition shadow-[0_0_15px_rgba(63,78,255,0.3)]">
                Retry Same Role
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
