// e:/AI Talent OS/src/pages/SkillGapDetector/SkillGapDetector.tsx
import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import {
  Sparkles, CheckCircle2, XCircle, ArrowRight, Search, Target,
  BookOpen, Award, TrendingUp, Clock, Briefcase, GraduationCap,
  ChevronDown, Star, Zap, BarChart3, Shield
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// UNIVERSAL CAREER LIBRARY — 50+ roles across 10 domains
// ═══════════════════════════════════════════════════════════════

interface CareerProfile {
  role: string;
  domain: string;
  requiredSkills: string[];
  preferredSkills: string[];
  certifications: string[];
  tools: string[];
  industryKnowledge: string[];
  experienceLevel: string;
  salaryRange: string;
  demandLevel: 'High' | 'Very High' | 'Medium' | 'Growing';
}

const careerLibrary: CareerProfile[] = [
  // ─── Technology ────────────────────────────────────
  { role: 'AI Engineer', domain: 'Technology', requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'SQL', 'Docker', 'AWS', 'LangChain', 'Vector Databases'], preferredSkills: ['Kubernetes', 'MLflow', 'ONNX', 'Prompt Engineering', 'RAG'], certifications: ['AWS ML Specialty', 'Google Professional ML Engineer', 'DeepLearning.AI'], tools: ['Jupyter', 'VS Code', 'Git', 'Weights & Biases', 'Hugging Face'], industryKnowledge: ['NLP', 'Computer Vision', 'Generative AI', 'Model Deployment'], experienceLevel: '2-5 years', salaryRange: '$150K–$310K', demandLevel: 'Very High' },
  { role: 'Machine Learning Engineer', domain: 'Technology', requiredSkills: ['Python', 'PyTorch', 'C++', 'SQL', 'Docker', 'Kubernetes', 'MLflow', 'Feature Engineering'], preferredSkills: ['CUDA', 'Distributed Training', 'Model Monitoring', 'A/B Testing'], certifications: ['Google Professional ML Engineer', 'AWS ML Specialty', 'Databricks ML'], tools: ['Jupyter', 'Kubeflow', 'MLflow', 'Airflow', 'Spark'], industryKnowledge: ['Statistical Modeling', 'Data Pipelines', 'Real-time Inference'], experienceLevel: '3-6 years', salaryRange: '$140K–$280K', demandLevel: 'Very High' },
  { role: 'Data Scientist', domain: 'Technology', requiredSkills: ['Python', 'R', 'SQL', 'Pandas', 'Scikit-Learn', 'Statistics', 'Data Visualization'], preferredSkills: ['Tableau', 'dbt', 'Causal Inference', 'Bayesian Methods'], certifications: ['IBM Data Science Professional', 'Google Data Analytics'], tools: ['Jupyter', 'Tableau', 'Power BI', 'Excel', 'Git'], industryKnowledge: ['Experiment Design', 'Business Intelligence', 'Product Analytics'], experienceLevel: '1-4 years', salaryRange: '$120K–$250K', demandLevel: 'High' },
  { role: 'Data Analyst', domain: 'Technology', requiredSkills: ['SQL', 'Excel', 'Python', 'Data Visualization', 'Statistics'], preferredSkills: ['Tableau', 'Power BI', 'Google Analytics', 'Looker'], certifications: ['Google Data Analytics', 'Microsoft Power BI'], tools: ['Excel', 'Tableau', 'Power BI', 'SQL Server', 'BigQuery'], industryKnowledge: ['Business Reporting', 'KPI Tracking', 'Dashboard Design'], experienceLevel: '0-3 years', salaryRange: '$60K–$110K', demandLevel: 'High' },
  { role: 'Full Stack Developer', domain: 'Technology', requiredSkills: ['TypeScript', 'React', 'Node.js', 'SQL', 'Git', 'CSS', 'REST APIs', 'Docker'], preferredSkills: ['Next.js', 'tRPC', 'Prisma', 'WebSocket', 'GraphQL'], certifications: ['Meta Frontend Developer', 'AWS Solutions Architect'], tools: ['VS Code', 'Git', 'Postman', 'Figma', 'Docker'], industryKnowledge: ['CI/CD', 'Agile', 'System Design', 'Testing'], experienceLevel: '2-5 years', salaryRange: '$110K–$220K', demandLevel: 'High' },
  { role: 'Frontend Developer', domain: 'Technology', requiredSkills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Responsive Design'], preferredSkills: ['Next.js', 'Accessibility (WCAG)', 'Performance Optimization', 'Design Systems'], certifications: ['Meta Frontend Developer', 'Google UX Design'], tools: ['VS Code', 'Figma', 'Chrome DevTools', 'Storybook'], industryKnowledge: ['Web Standards', 'Browser APIs', 'Core Web Vitals'], experienceLevel: '1-4 years', salaryRange: '$100K–$200K', demandLevel: 'High' },
  { role: 'Backend Developer', domain: 'Technology', requiredSkills: ['Python', 'Node.js', 'SQL', 'REST APIs', 'Git', 'Docker', 'Linux'], preferredSkills: ['gRPC', 'Redis', 'Kafka', 'Microservices', 'GraphQL'], certifications: ['AWS Solutions Architect', 'Kubernetes CKA'], tools: ['VS Code', 'Postman', 'Docker', 'PostgreSQL', 'Redis'], industryKnowledge: ['System Design', 'Database Design', 'API Security'], experienceLevel: '2-5 years', salaryRange: '$120K–$240K', demandLevel: 'High' },
  { role: 'DevOps Engineer', domain: 'Technology', requiredSkills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'AWS', 'Bash'], preferredSkills: ['ArgoCD', 'Istio', 'Prometheus', 'FinOps'], certifications: ['CKA/CKAD', 'AWS DevOps Engineer', 'Terraform Associate'], tools: ['Jenkins', 'GitHub Actions', 'Terraform', 'Ansible', 'Grafana'], industryKnowledge: ['Platform Engineering', 'Site Reliability', 'Infrastructure as Code'], experienceLevel: '3-6 years', salaryRange: '$130K–$260K', demandLevel: 'Very High' },
  { role: 'Cloud Engineer', domain: 'Technology', requiredSkills: ['AWS', 'Azure', 'Linux', 'Networking', 'Docker', 'Terraform', 'Python'], preferredSkills: ['GCP', 'Serverless', 'CDN', 'Multi-Cloud'], certifications: ['AWS Solutions Architect', 'Azure Administrator', 'GCP Cloud Engineer'], tools: ['Terraform', 'CloudFormation', 'Azure DevOps', 'Pulumi'], industryKnowledge: ['Cloud Architecture', 'Cost Optimization', 'Security Compliance'], experienceLevel: '2-5 years', salaryRange: '$120K–$250K', demandLevel: 'Very High' },
  { role: 'Cyber Security Analyst', domain: 'Technology', requiredSkills: ['Network Security', 'Linux', 'Python', 'SIEM', 'Firewalls', 'Incident Response'], preferredSkills: ['Penetration Testing', 'Cloud Security', 'Zero Trust', 'Threat Hunting'], certifications: ['CompTIA Security+', 'CEH', 'CISSP', 'AWS Security'], tools: ['Splunk', 'Wireshark', 'Nmap', 'Burp Suite', 'Metasploit'], industryKnowledge: ['Risk Assessment', 'Compliance (SOC2, ISO)', 'Vulnerability Management'], experienceLevel: '2-5 years', salaryRange: '$100K–$220K', demandLevel: 'Very High' },
  { role: 'Software Engineer', domain: 'Technology', requiredSkills: ['Data Structures', 'Algorithms', 'Python', 'Java', 'Git', 'SQL', 'System Design'], preferredSkills: ['Go', 'Rust', 'Microservices', 'Distributed Systems'], certifications: ['AWS Developer Associate', 'Oracle Java Certified'], tools: ['VS Code', 'IntelliJ', 'Git', 'Jira', 'Docker'], industryKnowledge: ['SDLC', 'Agile/Scrum', 'Code Review', 'Testing'], experienceLevel: '1-5 years', salaryRange: '$110K–$240K', demandLevel: 'High' },
  { role: 'Mobile App Developer', domain: 'Technology', requiredSkills: ['React Native', 'TypeScript', 'REST APIs', 'Git', 'UI/UX Basics'], preferredSkills: ['Swift', 'Kotlin', 'Flutter', 'Firebase'], certifications: ['Meta React Native', 'Google Associate Android'], tools: ['Xcode', 'Android Studio', 'Expo', 'Figma'], industryKnowledge: ['App Store Guidelines', 'Push Notifications', 'Offline Storage'], experienceLevel: '1-4 years', salaryRange: '$100K–$200K', demandLevel: 'High' },
  { role: 'QA Engineer', domain: 'Technology', requiredSkills: ['Test Automation', 'Selenium', 'Python', 'SQL', 'API Testing', 'Git'], preferredSkills: ['Cypress', 'Playwright', 'Performance Testing', 'CI/CD'], certifications: ['ISTQB Foundation', 'AWS Developer'], tools: ['Selenium', 'Jira', 'Postman', 'Jenkins', 'TestRail'], industryKnowledge: ['Test Strategy', 'BDD/TDD', 'Regression Planning'], experienceLevel: '1-4 years', salaryRange: '$80K–$160K', demandLevel: 'Medium' },
  { role: 'Blockchain Developer', domain: 'Technology', requiredSkills: ['Solidity', 'JavaScript', 'Web3.js', 'Smart Contracts', 'Cryptography'], preferredSkills: ['Rust', 'DeFi Protocols', 'Layer 2 Solutions', 'IPFS'], certifications: ['Certified Blockchain Developer', 'ConsenSys Academy'], tools: ['Hardhat', 'Truffle', 'MetaMask', 'Remix IDE', 'Etherscan'], industryKnowledge: ['DeFi', 'NFTs', 'Tokenomics', 'DAO Governance'], experienceLevel: '1-4 years', salaryRange: '$120K–$250K', demandLevel: 'Growing' },

  // ─── Business ──────────────────────────────────────
  { role: 'Business Analyst', domain: 'Business', requiredSkills: ['SQL', 'Excel', 'Data Analysis', 'Requirements Gathering', 'Stakeholder Management'], preferredSkills: ['Tableau', 'Power BI', 'JIRA', 'Process Mapping'], certifications: ['CBAP', 'PMI-PBA', 'Google Data Analytics'], tools: ['Excel', 'Jira', 'Confluence', 'Tableau', 'Visio'], industryKnowledge: ['Business Process', 'Agile', 'User Stories', 'KPIs'], experienceLevel: '1-4 years', salaryRange: '$70K–$130K', demandLevel: 'High' },
  { role: 'Product Manager', domain: 'Business', requiredSkills: ['Product Strategy', 'SQL', 'User Research', 'Roadmap Planning', 'A/B Testing'], preferredSkills: ['Data Analytics', 'AI Product Strategy', 'Pricing Strategy'], certifications: ['Product School PM', 'Pragmatic Institute', 'Google PM'], tools: ['Jira', 'Figma', 'Amplitude', 'Mixpanel', 'Notion'], industryKnowledge: ['Market Analysis', 'Go-to-Market', 'OKRs'], experienceLevel: '3-7 years', salaryRange: '$120K–$250K', demandLevel: 'High' },
  { role: 'Project Manager', domain: 'Business', requiredSkills: ['Project Planning', 'Risk Management', 'Stakeholder Management', 'Budgeting', 'Agile'], preferredSkills: ['PMP Methodology', 'Earned Value Management', 'Resource Planning'], certifications: ['PMP', 'PRINCE2', 'CSM', 'Google Project Management'], tools: ['Jira', 'MS Project', 'Asana', 'Trello', 'Confluence'], industryKnowledge: ['SDLC', 'Waterfall', 'Scrum', 'Change Management'], experienceLevel: '3-7 years', salaryRange: '$90K–$170K', demandLevel: 'High' },
  { role: 'HR Manager', domain: 'Business', requiredSkills: ['Recruitment', 'Employee Relations', 'Compensation & Benefits', 'Labor Law', 'Performance Management'], preferredSkills: ['HR Analytics', 'DEI Strategy', 'Employer Branding'], certifications: ['SHRM-CP', 'PHR', 'CIPD'], tools: ['Workday', 'BambooHR', 'LinkedIn Recruiter', 'ADP', 'SAP SuccessFactors'], industryKnowledge: ['Employment Law', 'Organizational Development', 'Talent Strategy'], experienceLevel: '4-8 years', salaryRange: '$80K–$160K', demandLevel: 'Medium' },
  { role: 'Operations Manager', domain: 'Business', requiredSkills: ['Process Optimization', 'Supply Chain', 'Budget Management', 'Team Leadership', 'Data Analysis'], preferredSkills: ['Six Sigma', 'Lean Management', 'ERP Systems'], certifications: ['Six Sigma Green Belt', 'PMP', 'APICS CPIM'], tools: ['SAP', 'Oracle ERP', 'Excel', 'Power BI', 'Slack'], industryKnowledge: ['Logistics', 'Inventory Management', 'Quality Control'], experienceLevel: '4-8 years', salaryRange: '$80K–$150K', demandLevel: 'Medium' },
  { role: 'Sales Manager', domain: 'Business', requiredSkills: ['Sales Strategy', 'CRM Management', 'Negotiation', 'Pipeline Management', 'Team Leadership'], preferredSkills: ['Account-Based Selling', 'Revenue Operations', 'Sales Analytics'], certifications: ['Certified Sales Professional', 'HubSpot Sales'], tools: ['Salesforce', 'HubSpot', 'Gong', 'Outreach', 'LinkedIn Sales Navigator'], industryKnowledge: ['B2B/B2C Sales', 'Enterprise Sales', 'Sales Enablement'], experienceLevel: '3-7 years', salaryRange: '$90K–$180K', demandLevel: 'High' },
  { role: 'Marketing Manager', domain: 'Business', requiredSkills: ['Digital Marketing', 'Content Strategy', 'SEO', 'Analytics', 'Brand Management'], preferredSkills: ['Performance Marketing', 'Marketing Automation', 'Growth Hacking'], certifications: ['Google Ads Certification', 'HubSpot Marketing', 'Meta Blueprint'], tools: ['Google Analytics', 'HubSpot', 'Mailchimp', 'SEMrush', 'Canva'], industryKnowledge: ['Brand Strategy', 'Lead Generation', 'Market Research'], experienceLevel: '3-6 years', salaryRange: '$80K–$160K', demandLevel: 'High' },

  // ─── Finance ───────────────────────────────────────
  { role: 'Accountant', domain: 'Finance', requiredSkills: ['Financial Reporting', 'GAAP', 'Tax Preparation', 'Excel', 'Bookkeeping'], preferredSkills: ['IFRS', 'Forensic Accounting', 'ERP Systems'], certifications: ['CPA', 'CMA', 'ACCA'], tools: ['QuickBooks', 'SAP', 'Excel', 'Xero', 'NetSuite'], industryKnowledge: ['Tax Law', 'Auditing Standards', 'Compliance'], experienceLevel: '1-5 years', salaryRange: '$55K–$110K', demandLevel: 'Medium' },
  { role: 'Financial Analyst', domain: 'Finance', requiredSkills: ['Financial Modeling', 'Excel', 'SQL', 'Valuation', 'Data Analysis'], preferredSkills: ['Python', 'Tableau', 'Bloomberg Terminal', 'VBA'], certifications: ['CFA', 'FRM', 'Financial Modeling Certification'], tools: ['Excel', 'Bloomberg', 'Capital IQ', 'Tableau', 'Python'], industryKnowledge: ['M&A', 'Corporate Finance', 'Market Analysis'], experienceLevel: '1-4 years', salaryRange: '$70K–$150K', demandLevel: 'High' },
  { role: 'Investment Banker', domain: 'Finance', requiredSkills: ['Financial Modeling', 'Valuation', 'M&A', 'Excel', 'Presentation Skills'], preferredSkills: ['LBO Modeling', 'Industry Analysis', 'Capital Markets'], certifications: ['CFA', 'Series 7', 'Series 63'], tools: ['Excel', 'Bloomberg', 'Capital IQ', 'PitchBook', 'PowerPoint'], industryKnowledge: ['Deal Structuring', 'IPOs', 'Debt Markets'], experienceLevel: '2-6 years', salaryRange: '$100K–$300K+', demandLevel: 'Medium' },
  { role: 'Risk Analyst', domain: 'Finance', requiredSkills: ['Risk Assessment', 'Statistics', 'Excel', 'SQL', 'Financial Regulation'], preferredSkills: ['Python', 'Monte Carlo Simulation', 'Stress Testing'], certifications: ['FRM', 'PRM', 'CFA'], tools: ['Excel', 'SAS', 'R', 'Python', 'MATLAB'], industryKnowledge: ['Basel Regulations', 'Credit Risk', 'Market Risk'], experienceLevel: '2-5 years', salaryRange: '$80K–$160K', demandLevel: 'Growing' },
  { role: 'Auditor', domain: 'Finance', requiredSkills: ['Auditing Standards', 'Financial Analysis', 'Risk Assessment', 'Excel', 'Compliance'], preferredSkills: ['Data Analytics', 'Forensic Auditing', 'IT Audit'], certifications: ['CPA', 'CIA', 'CISA'], tools: ['Excel', 'ACL', 'SAP', 'TeamMate', 'AuditBoard'], industryKnowledge: ['SOX Compliance', 'Internal Controls', 'Fraud Detection'], experienceLevel: '2-6 years', salaryRange: '$65K–$140K', demandLevel: 'Medium' },

  // ─── Design ────────────────────────────────────────
  { role: 'UI UX Designer', domain: 'Design', requiredSkills: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'Usability Testing'], preferredSkills: ['Motion Design', 'Design Systems', 'Accessibility', 'Design Tokens'], certifications: ['Google UX Design', 'Nielsen Norman UX', 'IDF Certification'], tools: ['Figma', 'Sketch', 'Adobe XD', 'Miro', 'Maze'], industryKnowledge: ['Design Thinking', 'Information Architecture', 'User Psychology'], experienceLevel: '1-4 years', salaryRange: '$90K–$190K', demandLevel: 'High' },
  { role: 'Graphic Designer', domain: 'Design', requiredSkills: ['Adobe Photoshop', 'Adobe Illustrator', 'Typography', 'Color Theory', 'Layout Design'], preferredSkills: ['After Effects', 'Branding', '3D Design', 'Print Design'], certifications: ['Adobe Certified Professional', 'Canva Design'], tools: ['Photoshop', 'Illustrator', 'InDesign', 'Canva', 'Figma'], industryKnowledge: ['Brand Identity', 'Marketing Collateral', 'Print Production'], experienceLevel: '1-4 years', salaryRange: '$50K–$100K', demandLevel: 'Medium' },
  { role: 'Product Designer', domain: 'Design', requiredSkills: ['Product Thinking', 'UX Research', 'Visual Design', 'Prototyping', 'Design Systems'], preferredSkills: ['Frontend Basics', 'Data-Driven Design', 'Workshop Facilitation'], certifications: ['Google UX Design', 'IDEO Design Thinking'], tools: ['Figma', 'FigJam', 'Notion', 'Loom', 'Amplitude'], industryKnowledge: ['Product Strategy', 'A/B Testing', 'Metrics-Driven Design'], experienceLevel: '2-5 years', salaryRange: '$100K–$200K', demandLevel: 'High' },
  { role: 'Motion Designer', domain: 'Design', requiredSkills: ['After Effects', 'Animation Principles', 'Storyboarding', 'Typography Animation'], preferredSkills: ['Cinema 4D', 'Rive', 'Lottie', 'Video Editing'], certifications: ['Adobe Motion Graphics', 'School of Motion'], tools: ['After Effects', 'Cinema 4D', 'Premiere Pro', 'Rive', 'Blender'], industryKnowledge: ['Brand Animation', 'UI Animation', 'Explainer Videos'], experienceLevel: '1-4 years', salaryRange: '$70K–$140K', demandLevel: 'Growing' },

  // ─── Healthcare ────────────────────────────────────
  { role: 'Doctor', domain: 'Healthcare', requiredSkills: ['Clinical Diagnosis', 'Patient Care', 'Medical Knowledge', 'Communication', 'Emergency Medicine'], preferredSkills: ['Research', 'Telemedicine', 'Specialization', 'Medical AI'], certifications: ['MD/MBBS', 'Board Certification', 'USMLE/NEET'], tools: ['EMR Systems', 'Medical Imaging', 'Telemedicine Platforms'], industryKnowledge: ['Evidence-Based Medicine', 'Patient Safety', 'Medical Ethics'], experienceLevel: '6-10+ years', salaryRange: '$200K–$500K+', demandLevel: 'Very High' },
  { role: 'Nurse', domain: 'Healthcare', requiredSkills: ['Patient Assessment', 'Medication Administration', 'Clinical Skills', 'Communication', 'Emergency Care'], preferredSkills: ['Specialization (ICU/ER)', 'Patient Education', 'Leadership'], certifications: ['BSN/RN', 'NCLEX', 'BLS/ACLS'], tools: ['EMR Systems', 'Vital Sign Monitors', 'IV Pumps'], industryKnowledge: ['Patient Safety Protocols', 'Infection Control', 'Care Plans'], experienceLevel: '1-5 years', salaryRange: '$60K–$120K', demandLevel: 'Very High' },
  { role: 'Pharmacist', domain: 'Healthcare', requiredSkills: ['Pharmacology', 'Drug Interactions', 'Patient Counseling', 'Prescription Management'], preferredSkills: ['Clinical Pharmacy', 'Pharmaceutical Research', 'Compounding'], certifications: ['PharmD', 'NAPLEX', 'State License'], tools: ['Pharmacy Management Systems', 'Drug Databases', 'EMR'], industryKnowledge: ['Drug Regulations', 'Formulary Management', 'Pharmacovigilance'], experienceLevel: '2-6 years', salaryRange: '$100K–$160K', demandLevel: 'Medium' },
  { role: 'Medical Lab Technician', domain: 'Healthcare', requiredSkills: ['Lab Testing', 'Microscopy', 'Quality Control', 'Sample Processing', 'Lab Safety'], preferredSkills: ['Molecular Biology', 'PCR', 'Flow Cytometry'], certifications: ['MLT Certification', 'ASCP Board', 'AMT'], tools: ['Lab Analyzers', 'Microscopes', 'LIMS', 'Centrifuges'], industryKnowledge: ['Lab Regulations', 'CLIA Standards', 'Biosafety'], experienceLevel: '1-3 years', salaryRange: '$40K–$70K', demandLevel: 'Medium' },
  { role: 'Healthcare Administrator', domain: 'Healthcare', requiredSkills: ['Healthcare Management', 'Budgeting', 'Regulatory Compliance', 'Operations', 'Leadership'], preferredSkills: ['Healthcare IT', 'Quality Improvement', 'Strategic Planning'], certifications: ['MHA', 'FACHE', 'CPHQ'], tools: ['EMR Systems', 'SAP', 'Excel', 'Project Management Tools'], industryKnowledge: ['HIPAA', 'Healthcare Policy', 'Accreditation Standards'], experienceLevel: '4-8 years', salaryRange: '$80K–$180K', demandLevel: 'Growing' },

  // ─── Education ─────────────────────────────────────
  { role: 'Teacher', domain: 'Education', requiredSkills: ['Curriculum Design', 'Classroom Management', 'Assessment', 'Communication', 'Subject Expertise'], preferredSkills: ['EdTech Tools', 'Differentiated Instruction', 'IEP Development'], certifications: ['Teaching License', 'B.Ed', 'TESOL/TEFL'], tools: ['Google Classroom', 'Zoom', 'Canvas', 'Kahoot', 'Smart Board'], industryKnowledge: ['Pedagogy', 'Student Psychology', 'Education Standards'], experienceLevel: '0-5 years', salaryRange: '$40K–$80K', demandLevel: 'High' },
  { role: 'Professor', domain: 'Education', requiredSkills: ['Research', 'Teaching', 'Publication', 'Mentoring', 'Grant Writing'], preferredSkills: ['Peer Review', 'Conference Presentation', 'Online Course Design'], certifications: ['PhD/Doctorate', 'Research Ethics'], tools: ['LaTeX', 'SPSS', 'R', 'Google Scholar', 'LMS Platforms'], industryKnowledge: ['Academic Research', 'Peer Review Process', 'Academic Publishing'], experienceLevel: '5-10+ years', salaryRange: '$70K–$180K', demandLevel: 'Medium' },
  { role: 'Educational Consultant', domain: 'Education', requiredSkills: ['Curriculum Development', 'Policy Analysis', 'Training', 'Assessment Design', 'Communication'], preferredSkills: ['EdTech Strategy', 'Data-Driven Education', 'Instructional Design'], certifications: ['M.Ed', 'Instructional Design Cert', 'Project Management'], tools: ['LMS Platforms', 'Google Suite', 'Articulate', 'Canva'], industryKnowledge: ['Education Policy', 'Accreditation', 'Learning Sciences'], experienceLevel: '3-7 years', salaryRange: '$60K–$120K', demandLevel: 'Growing' },
  { role: 'Academic Coordinator', domain: 'Education', requiredSkills: ['Academic Planning', 'Student Support', 'Scheduling', 'Communication', 'Organization'], preferredSkills: ['Data Analysis', 'Event Management', 'Counseling'], certifications: ['M.Ed', 'Administrative Certification'], tools: ['Student Information Systems', 'Excel', 'Google Suite', 'LMS'], industryKnowledge: ['Academic Standards', 'Student Affairs', 'Enrollment Management'], experienceLevel: '2-5 years', salaryRange: '$45K–$80K', demandLevel: 'Medium' },

  // ─── Engineering ───────────────────────────────────
  { role: 'Mechanical Engineer', domain: 'Engineering', requiredSkills: ['CAD/CAM', 'Thermodynamics', 'Material Science', 'Manufacturing', 'Mechanics'], preferredSkills: ['FEA', 'CFD', '3D Printing', 'Robotics'], certifications: ['PE License', 'ASME Certification', 'Six Sigma'], tools: ['SolidWorks', 'AutoCAD', 'ANSYS', 'MATLAB', 'Catia'], industryKnowledge: ['GD&T', 'Quality Standards', 'Product Development'], experienceLevel: '2-6 years', salaryRange: '$70K–$140K', demandLevel: 'Medium' },
  { role: 'Civil Engineer', domain: 'Engineering', requiredSkills: ['Structural Analysis', 'AutoCAD', 'Project Management', 'Geotechnical', 'Surveying'], preferredSkills: ['BIM', 'Environmental Engineering', 'Transportation'], certifications: ['PE License', 'LEED AP', 'FE Exam'], tools: ['AutoCAD', 'Revit', 'STAAD Pro', 'ETABS', 'GIS'], industryKnowledge: ['Building Codes', 'Environmental Regulations', 'Construction Management'], experienceLevel: '2-6 years', salaryRange: '$65K–$130K', demandLevel: 'Medium' },
  { role: 'Electrical Engineer', domain: 'Engineering', requiredSkills: ['Circuit Design', 'Power Systems', 'Control Systems', 'Embedded Systems', 'PCB Design'], preferredSkills: ['PLC Programming', 'FPGA', 'Signal Processing'], certifications: ['PE License', 'IEEE Certifications'], tools: ['MATLAB', 'Simulink', 'Altium', 'PSpice', 'LabVIEW'], industryKnowledge: ['Power Distribution', 'NEC Codes', 'Energy Systems'], experienceLevel: '2-6 years', salaryRange: '$75K–$140K', demandLevel: 'Medium' },
  { role: 'Electronics Engineer', domain: 'Engineering', requiredSkills: ['Analog Design', 'Digital Design', 'Microcontrollers', 'Embedded C', 'PCB Layout'], preferredSkills: ['VHDL/Verilog', 'IoT', 'Wireless Communication'], certifications: ['ARM Certified', 'Cisco IoT'], tools: ['Altium', 'Eagle', 'Arduino', 'Keil', 'Oscilloscope'], industryKnowledge: ['EMC/EMI', 'Signal Integrity', 'Product Compliance'], experienceLevel: '1-5 years', salaryRange: '$65K–$130K', demandLevel: 'Medium' },
  { role: 'Automobile Engineer', domain: 'Engineering', requiredSkills: ['Vehicle Dynamics', 'IC Engines', 'CAD', 'Material Science', 'Manufacturing'], preferredSkills: ['EV Technology', 'ADAS', 'Vehicle Testing', 'Aerodynamics'], certifications: ['SAE Certifications', 'PE License'], tools: ['CATIA', 'SolidWorks', 'ANSYS', 'MATLAB', 'CarSim'], industryKnowledge: ['Automotive Standards', 'Safety Regulations', 'EV Systems'], experienceLevel: '2-6 years', salaryRange: '$70K–$140K', demandLevel: 'Growing' },

  // ─── Government & Public Sector ────────────────────
  { role: 'Civil Services Officer', domain: 'Government', requiredSkills: ['Public Administration', 'Policy Analysis', 'Law', 'Communication', 'Leadership'], preferredSkills: ['Economics', 'Data Analysis', 'Crisis Management'], certifications: ['Civil Services Exam (UPSC/State)', 'Public Admin Degree'], tools: ['Government Portals', 'MS Office', 'Data Management Systems'], industryKnowledge: ['Constitutional Law', 'Public Policy', 'Governance'], experienceLevel: '0-5 years', salaryRange: '$30K–$100K', demandLevel: 'High' },
  { role: 'Police Officer', domain: 'Government', requiredSkills: ['Law Enforcement', 'Communication', 'Physical Fitness', 'Investigation', 'Report Writing'], preferredSkills: ['Forensics', 'Cybercrime', 'Community Relations'], certifications: ['Police Academy Training', 'Law Enforcement Cert'], tools: ['Body Cameras', 'Dispatch Systems', 'Forensic Tools'], industryKnowledge: ['Criminal Law', 'Procedures', 'Community Policing'], experienceLevel: '0-5 years', salaryRange: '$40K–$90K', demandLevel: 'High' },
  { role: 'Government Analyst', domain: 'Government', requiredSkills: ['Data Analysis', 'Policy Research', 'Excel', 'Report Writing', 'Statistics'], preferredSkills: ['SQL', 'Python', 'GIS', 'Public Economics'], certifications: ['Policy Analysis Certificate', 'Data Analytics Cert'], tools: ['Excel', 'SPSS', 'Tableau', 'GIS Software', 'R'], industryKnowledge: ['Government Regulations', 'Budget Analysis', 'Program Evaluation'], experienceLevel: '1-4 years', salaryRange: '$50K–$100K', demandLevel: 'Medium' },
  { role: 'Administrative Officer', domain: 'Government', requiredSkills: ['Administration', 'Communication', 'Record Management', 'Public Dealing', 'MS Office'], preferredSkills: ['Project Management', 'Digital Governance', 'Training'], certifications: ['Administrative Exam', 'Public Admin Degree'], tools: ['MS Office', 'ERP Systems', 'Government Portals'], industryKnowledge: ['Administrative Law', 'Record Keeping', 'Public Service Delivery'], experienceLevel: '1-5 years', salaryRange: '$35K–$80K', demandLevel: 'Medium' },

  // ─── Media & Content ───────────────────────────────
  { role: 'Content Writer', domain: 'Media & Content', requiredSkills: ['Writing', 'SEO', 'Research', 'Grammar', 'Content Strategy'], preferredSkills: ['Copywriting', 'Email Marketing', 'Social Media', 'AI Writing Tools'], certifications: ['HubSpot Content Marketing', 'Google Digital Marketing'], tools: ['WordPress', 'Grammarly', 'SEMrush', 'Google Analytics', 'Notion'], industryKnowledge: ['Content Marketing', 'Brand Voice', 'Content Distribution'], experienceLevel: '0-3 years', salaryRange: '$40K–$90K', demandLevel: 'High' },
  { role: 'Copywriter', domain: 'Media & Content', requiredSkills: ['Persuasive Writing', 'Brand Voice', 'A/B Testing Copy', 'Headlines', 'CTA Writing'], preferredSkills: ['UX Writing', 'Conversion Optimization', 'Storytelling'], certifications: ['AWAI Copywriting', 'HubSpot Content Marketing'], tools: ['Google Docs', 'Hemingway', 'Copy.ai', 'Figma', 'Unbounce'], industryKnowledge: ['Direct Response', 'Brand Messaging', 'Consumer Psychology'], experienceLevel: '1-4 years', salaryRange: '$50K–$110K', demandLevel: 'High' },
  { role: 'Journalist', domain: 'Media & Content', requiredSkills: ['Investigative Reporting', 'Interviewing', 'Fact-Checking', 'Writing', 'Deadlines'], preferredSkills: ['Data Journalism', 'Multimedia Reporting', 'Podcasting'], certifications: ['Journalism Degree', 'Press Credentials'], tools: ['WordPress', 'Adobe Premiere', 'Audio Recorders', 'CMS Platforms'], industryKnowledge: ['Media Ethics', 'Press Law', 'Source Protection'], experienceLevel: '1-5 years', salaryRange: '$40K–$100K', demandLevel: 'Medium' },
  { role: 'Video Editor', domain: 'Media & Content', requiredSkills: ['Video Editing', 'Color Grading', 'Audio Mixing', 'Storytelling', 'Motion Graphics'], preferredSkills: ['VFX', '3D Compositing', 'Live Streaming', 'Animation'], certifications: ['Adobe Certified Premiere', 'DaVinci Resolve Cert'], tools: ['Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Final Cut', 'Audition'], industryKnowledge: ['Broadcast Standards', 'Social Media Formats', 'Codec Optimization'], experienceLevel: '1-4 years', salaryRange: '$45K–$100K', demandLevel: 'High' },
  { role: 'Content Strategist', domain: 'Media & Content', requiredSkills: ['Content Planning', 'SEO Strategy', 'Analytics', 'Editorial Calendar', 'Audience Research'], preferredSkills: ['Thought Leadership', 'AI Content Tools', 'Personalization'], certifications: ['HubSpot Content Strategy', 'Content Marketing Institute'], tools: ['SEMrush', 'Ahrefs', 'Google Analytics', 'Notion', 'Trello'], industryKnowledge: ['Content Funnel', 'Multi-channel Strategy', 'Brand Storytelling'], experienceLevel: '3-6 years', salaryRange: '$70K–$140K', demandLevel: 'High' },

  // ─── Emerging Careers ──────────────────────────────
  { role: 'Prompt Engineer', domain: 'Emerging Careers', requiredSkills: ['Prompt Design', 'LLM Understanding', 'Python', 'NLP Concepts', 'Evaluation Metrics'], preferredSkills: ['Fine-tuning', 'RAG', 'Multi-modal AI', 'Chain-of-Thought'], certifications: ['DeepLearning.AI Prompt Engineering', 'Anthropic Cert'], tools: ['OpenAI API', 'Claude', 'LangChain', 'Playground', 'Python'], industryKnowledge: ['LLM Capabilities', 'AI Safety', 'Hallucination Mitigation'], experienceLevel: '0-3 years', salaryRange: '$100K–$250K', demandLevel: 'Very High' },
  { role: 'Generative AI Engineer', domain: 'Emerging Careers', requiredSkills: ['Python', 'LLMs', 'RAG', 'Vector Databases', 'API Development', 'LangChain'], preferredSkills: ['Fine-tuning', 'Diffusion Models', 'Multi-Agent Systems', 'Guardrails'], certifications: ['DeepLearning.AI GenAI', 'AWS ML Specialty'], tools: ['LangChain', 'LlamaIndex', 'Pinecone', 'Hugging Face', 'OpenAI API'], industryKnowledge: ['AI Ethics', 'Model Evaluation', 'Production AI Systems'], experienceLevel: '1-4 years', salaryRange: '$150K–$350K', demandLevel: 'Very High' },
  { role: 'AI Product Manager', domain: 'Emerging Careers', requiredSkills: ['Product Strategy', 'AI/ML Understanding', 'Data Literacy', 'User Research', 'Roadmapping'], preferredSkills: ['SQL', 'Python Basics', 'Experiment Design', 'AI Ethics'], certifications: ['Product School AI PM', 'Google PM Certificate'], tools: ['Jira', 'Figma', 'Amplitude', 'Notion', 'Python'], industryKnowledge: ['AI Product Lifecycle', 'Model Governance', 'AI Regulations'], experienceLevel: '3-6 years', salaryRange: '$140K–$280K', demandLevel: 'Very High' },
  { role: 'MLOps Engineer', domain: 'Emerging Careers', requiredSkills: ['Python', 'Docker', 'Kubernetes', 'CI/CD', 'MLflow', 'Cloud Platforms'], preferredSkills: ['Feature Stores', 'Model Monitoring', 'Data Versioning', 'Kubeflow'], certifications: ['Google Professional ML Engineer', 'CKA', 'AWS ML Specialty'], tools: ['MLflow', 'Kubeflow', 'Airflow', 'DVC', 'Weights & Biases'], industryKnowledge: ['Model Lifecycle', 'Data Drift', 'Experiment Tracking'], experienceLevel: '2-5 years', salaryRange: '$130K–$260K', demandLevel: 'Very High' },
  { role: 'AI Research Scientist', domain: 'Emerging Careers', requiredSkills: ['Mathematics', 'Deep Learning', 'Python', 'Research Methodology', 'Paper Writing'], preferredSkills: ['JAX', 'Theorem Proving', 'Reinforcement Learning', 'Diffusion Models'], certifications: ['PhD in CS/AI/ML', 'Published Research'], tools: ['PyTorch', 'JAX', 'LaTeX', 'Weights & Biases', 'ArXiv'], industryKnowledge: ['Research Ethics', 'Peer Review', 'State-of-the-Art Methods'], experienceLevel: '5-10+ years', salaryRange: '$180K–$400K+', demandLevel: 'Very High' },
];

const domains = [...new Set(careerLibrary.map(c => c.domain))];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

type ResultTab = 'overview' | 'gaps' | 'readiness' | 'roadmap' | 'resources';

export const SkillGapDetector: React.FC = () => {
  const { userProfile, updateUserProfile } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [target, setTarget] = useState(userProfile.targetRole || 'AI Engineer');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultTab>('overview');
  const [showDropdown, setShowDropdown] = useState(false);

  // Filtered career list
  const filteredCareers = useMemo(() => {
    let list = careerLibrary;
    if (selectedDomain !== 'All') list = list.filter(c => c.domain === selectedDomain);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.role.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q));
    }
    return list;
  }, [selectedDomain, searchQuery]);

  // Analysis data
  const [analysis, setAnalysis] = useState<{
    profile: CareerProfile;
    matching: string[];
    missing: string[];
    matchPercent: number;
    priority: { skill: string; difficulty: 'Easy' | 'Medium' | 'Hard'; timeWeeks: number; resource: string }[];
    readiness: { technical: number; tools: number; certification: number; industry: number; overall: number };
  } | null>(null);

  const handleSelectRole = (role: string) => {
    setTarget(role);
    setShowDropdown(false);
    setSearchQuery('');
    setAnalyzed(false);
    setAnalysis(null);
  };

  const handleRunAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      const profile = careerLibrary.find(c => c.role === target) || careerLibrary[0];
      const currentLower = userProfile.skills.map(s => s.toLowerCase());

      const matching = profile.requiredSkills.filter(s => currentLower.includes(s.toLowerCase()));
      const missing = profile.requiredSkills.filter(s => !currentLower.includes(s.toLowerCase()));
      const matchPercent = Math.round((matching.length / profile.requiredSkills.length) * 100);

      // Difficulty assignment
      const hardSkills = ['CUDA', 'Kubernetes', 'PyTorch', 'System Design', 'Distributed Training', 'Penetration Testing', 'Deep Learning', 'Research Methodology', 'Financial Modeling', 'Structural Analysis', 'Pharmacology', 'Clinical Diagnosis'];
      const easySkills = ['Git', 'CSS', 'SQL', 'Excel', 'HTML', 'Communication', 'MS Office', 'Writing', 'Bookkeeping', 'Organization'];

      const priority = missing.map(s => {
        let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
        let timeWeeks = 4;
        if (hardSkills.some(h => s.toLowerCase().includes(h.toLowerCase()))) { difficulty = 'Hard'; timeWeeks = 8; }
        else if (easySkills.some(e => s.toLowerCase().includes(e.toLowerCase()))) { difficulty = 'Easy'; timeWeeks = 2; }
        const resource = difficulty === 'Hard' ? `Advanced ${s} Masterclass` : difficulty === 'Easy' ? `${s} Quick Start Guide` : `${s} Professional Course`;
        return { skill: s, difficulty, timeWeeks, resource };
      });

      // Readiness scoring
      const totalRequired = profile.requiredSkills.length;
      const technicalScore = Math.round((matching.length / totalRequired) * 100);
      const toolsOwned = profile.tools.filter(t => currentLower.includes(t.toLowerCase())).length;
      const toolsScore = Math.round((toolsOwned / Math.max(profile.tools.length, 1)) * 100);
      const certScore = Math.min(100, profile.certifications.length > 0 ? 25 : 0); // Base — user would need certs
      const industryScore = Math.round(Math.min(100, technicalScore * 0.7 + toolsScore * 0.3));
      const overall = Math.round(technicalScore * 0.4 + toolsScore * 0.2 + certScore * 0.15 + industryScore * 0.25);

      setAnalysis({
        profile,
        matching,
        missing,
        matchPercent,
        priority,
        readiness: { technical: technicalScore, tools: toolsScore, certification: certScore, industry: industryScore, overall },
      });

      updateUserProfile({ targetRole: target, missingSkills: missing });
      setAnalyzed(true);
      setLoading(false);
    }, 1200);
  };

  const selectedProfile = careerLibrary.find(c => c.role === target);

  const resultTabs: { key: ResultTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { key: 'gaps', label: 'Gap Analysis', icon: <Target className="h-3.5 w-3.5" /> },
    { key: 'readiness', label: 'Readiness', icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: 'roadmap', label: 'Learning Path', icon: <Clock className="h-3.5 w-3.5" /> },
    { key: 'resources', label: 'Resources', icon: <BookOpen className="h-3.5 w-3.5" /> },
  ];

  // Progress bar component
  const ProgressBar: React.FC<{ value: number; color?: string; label: string }> = ({ value, color = 'bg-brand-indigo', label }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-brand-silver font-medium">{label}</span>
        <span className="text-white font-bold">{value}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo top-10 left-10 animate-pulse-slow"></div>
      <div className="glow-orb-cyan bottom-10 right-10 animate-pulse-slow"></div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-white">AI Skill Gap Detector</h1>
            <p className="text-brand-silver text-sm mt-1">
              Universal career skill analysis across {careerLibrary.length}+ roles in {domains.length} industries.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 text-[10px] font-bold text-brand-cyan">
            {careerLibrary.length} Careers
          </div>
        </div>

        {/* ── Role Selector ── */}
        <GlassCard>
          <div className="flex flex-col lg:flex-row items-end gap-4">
            {/* Domain filter */}
            <div className="w-full lg:w-48">
              <label className="block text-xs font-semibold text-brand-silver mb-1.5">Industry</label>
              <select
                value={selectedDomain}
                onChange={(e) => { setSelectedDomain(e.target.value); setShowDropdown(true); }}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-brand-cyan transition font-semibold"
              >
                <option value="All">All Industries</option>
                {domains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Searchable role selector */}
            <div className="flex-1 relative w-full">
              <label className="block text-xs font-semibold text-brand-silver mb-1.5">Target Career Role</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-silver" />
                <input
                  type="text"
                  value={showDropdown ? searchQuery : target}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search careers..."
                  className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-8 py-3 text-xs text-white outline-none focus:border-brand-cyan transition font-semibold"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-silver" />
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute z-30 top-full mt-1 w-full max-h-64 overflow-y-auto bg-brand-dark border border-brand-border rounded-xl shadow-2xl">
                  {filteredCareers.map((c) => (
                    <button
                      key={c.role}
                      onClick={() => handleSelectRole(c.role)}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-white/5 transition flex items-center justify-between ${
                        c.role === target ? 'bg-brand-indigo/10 text-brand-cyan' : 'text-white'
                      }`}
                    >
                      <span className="font-semibold">{c.role}</span>
                      <span className="text-[10px] text-brand-silver px-2 py-0.5 rounded bg-white/5">{c.domain}</span>
                    </button>
                  ))}
                  {filteredCareers.length === 0 && (
                    <div className="px-4 py-6 text-xs text-brand-silver text-center">No matching careers found.</div>
                  )}
                </div>
              )}
            </div>

            {/* Analyze button */}
            <button
              onClick={() => { setShowDropdown(false); handleRunAnalysis(); }}
              disabled={loading}
              className="w-full lg:w-auto px-6 py-3 rounded-xl bg-brand-indigo hover:bg-brand-indigo/80 disabled:opacity-50 text-white font-bold text-xs transition shadow-[0_0_15px_rgba(63,78,255,0.3)] shrink-0"
            >
              {loading ? "Analyzing..." : "⚡ Analyze Skills"}
            </button>
          </div>

          {/* Selected role preview */}
          {selectedProfile && (
            <div className="mt-4 pt-3 border-t border-brand-border flex flex-wrap gap-3 items-center">
              <span className="text-[10px] text-brand-silver font-semibold uppercase tracking-wider">Selected:</span>
              <span className="text-xs font-bold text-white">{selectedProfile.role}</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-indigo/10 border border-brand-indigo/20 text-brand-cyan">{selectedProfile.domain}</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 border border-white/10 text-brand-silver">{selectedProfile.experienceLevel}</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-success/10 border border-brand-success/20 text-brand-success">{selectedProfile.salaryRange}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                selectedProfile.demandLevel === 'Very High' ? 'bg-brand-error/10 border border-brand-error/20 text-brand-error' :
                selectedProfile.demandLevel === 'High' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' :
                'bg-white/5 border border-white/10 text-brand-silver'
              }`}>{selectedProfile.demandLevel} Demand</span>
            </div>
          )}
        </GlassCard>

        {/* ── Results ── */}
        {analyzed && analysis && !loading && (
          <div className="space-y-6">
            {/* Result tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {resultTabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    activeTab === t.key
                      ? 'bg-brand-indigo text-white shadow-md'
                      : 'bg-white/5 text-brand-silver hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* ─── TAB: Overview ─── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Skill Match', value: `${analysis.matchPercent}%`, icon: <Target className="h-4 w-4" />, color: analysis.matchPercent >= 70 ? 'text-brand-success' : analysis.matchPercent >= 40 ? 'text-amber-500' : 'text-brand-error' },
                    { label: 'Skills Found', value: `${analysis.matching.length}/${analysis.profile.requiredSkills.length}`, icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-brand-success' },
                    { label: 'Missing Skills', value: `${analysis.missing.length}`, icon: <XCircle className="h-4 w-4" />, color: 'text-brand-error' },
                    { label: 'Overall Ready', value: `${analysis.readiness.overall}%`, icon: <TrendingUp className="h-4 w-4" />, color: analysis.readiness.overall >= 60 ? 'text-brand-cyan' : 'text-amber-500' },
                  ].map((kpi, i) => (
                    <GlassCard key={i} className="text-center space-y-2">
                      <div className={`mx-auto ${kpi.color}`}>{kpi.icon}</div>
                      <div className={`text-2xl font-extrabold font-display ${kpi.color}`}>{kpi.value}</div>
                      <div className="text-[10px] text-brand-silver font-semibold uppercase tracking-wider">{kpi.label}</div>
                    </GlassCard>
                  ))}
                </div>

                {/* Skill match bar */}
                <GlassCard>
                  <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-brand-cyan" />
                    Skill Match Breakdown
                  </h3>
                  <div className="space-y-3">
                    <ProgressBar value={analysis.readiness.technical} label="Technical Skills" color="bg-brand-indigo" />
                    <ProgressBar value={analysis.readiness.tools} label="Tool Proficiency" color="bg-brand-cyan" />
                    <ProgressBar value={analysis.readiness.certification} label="Certifications" color="bg-amber-500" />
                    <ProgressBar value={analysis.readiness.industry} label="Industry Knowledge" color="bg-brand-success" />
                  </div>
                </GlassCard>

                {/* Quick skills grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-brand-border pb-2">
                      <CheckCircle2 className="h-4 w-4 text-brand-success" />
                      <h3 className="text-xs font-bold text-white">Your Strengths ({analysis.matching.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.matching.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-brand-success/10 border border-brand-success/20 rounded-lg text-[10px] font-bold text-brand-success">✓ {s}</span>
                      ))}
                      {analysis.matching.length === 0 && <span className="text-xs text-brand-silver">No matching skills yet.</span>}
                    </div>
                  </GlassCard>
                  <GlassCard className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-brand-border pb-2">
                      <XCircle className="h-4 w-4 text-brand-error" />
                      <h3 className="text-xs font-bold text-white">Skill Gaps ({analysis.missing.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missing.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-brand-error/10 border border-brand-error/20 rounded-lg text-[10px] font-bold text-brand-error">✕ {s}</span>
                      ))}
                      {analysis.missing.length === 0 && <span className="text-xs text-brand-success">All skills acquired! 🎉</span>}
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {/* ─── TAB: Gap Analysis ─── */}
            {activeTab === 'gaps' && (
              <div className="space-y-6">
                <GlassCard className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                    <Sparkles className="h-4 w-4 text-brand-cyan" />
                    <h3 className="font-display font-extrabold text-sm text-white">Priority Skills to Learn</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.priority.map((p, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-brand-indigo/30 transition">
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-full bg-brand-indigo/10 text-brand-cyan border border-brand-indigo/20 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                          <div>
                            <h4 className="text-xs font-bold text-white">{p.skill}</h4>
                            <p className="text-[10px] text-brand-silver">{p.resource} • ~{p.timeWeeks} weeks</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            p.difficulty === 'Hard' ? 'bg-brand-error/15 text-brand-error border border-brand-error/25' :
                            p.difficulty === 'Medium' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/25' :
                            'bg-brand-success/15 text-brand-success border border-brand-success/25'
                          }`}>{p.difficulty}</span>
                          <ArrowRight className="hidden sm:block h-3.5 w-3.5 text-brand-silver" />
                        </div>
                      </div>
                    ))}
                    {analysis.priority.length === 0 && (
                      <div className="text-center py-8 text-brand-success text-sm font-bold">🎉 No gaps — you're fully qualified!</div>
                    )}
                  </div>
                </GlassCard>

                {/* Preferred skills */}
                <GlassCard className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-brand-border pb-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-white">Preferred Skills (Bonus)</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.profile.preferredSkills.map((s, i) => {
                      const has = userProfile.skills.some(sk => sk.toLowerCase() === s.toLowerCase());
                      return (
                        <span key={i} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          has ? 'bg-brand-success/10 border-brand-success/20 text-brand-success' : 'bg-white/5 border-white/10 text-brand-silver'
                        }`}>{has ? '✓' : '○'} {s}</span>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>
            )}

            {/* ─── TAB: Readiness ─── */}
            {activeTab === 'readiness' && (
              <div className="space-y-6">
                {/* Big readiness score */}
                <GlassCard className="text-center py-8">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke={analysis.readiness.overall >= 70 ? '#10B981' : analysis.readiness.overall >= 40 ? '#F59E0B' : '#EF4444'} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${analysis.readiness.overall * 3.27} 327`} />
                    </svg>
                    <div className="absolute">
                      <div className="text-3xl font-extrabold font-display text-white">{analysis.readiness.overall}%</div>
                      <div className="text-[10px] text-brand-silver font-semibold">READY</div>
                    </div>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-white">{analysis.profile.role} Career Readiness</h3>
                  <p className="text-[10px] text-brand-silver mt-1">
                    {analysis.readiness.overall >= 70 ? '🟢 You are competitive for this role!' :
                     analysis.readiness.overall >= 40 ? '🟡 Good progress — keep building your skills.' :
                     '🔴 Significant gaps remain — follow the learning path below.'}
                  </p>
                </GlassCard>

                {/* Detailed readiness breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Technical Readiness', score: analysis.readiness.technical, icon: <Zap className="h-4 w-4" />, desc: `${analysis.matching.length} of ${analysis.profile.requiredSkills.length} required skills` },
                    { label: 'Tool Readiness', score: analysis.readiness.tools, icon: <Shield className="h-4 w-4" />, desc: `Proficiency in ${analysis.profile.tools.length} required tools` },
                    { label: 'Certification Readiness', score: analysis.readiness.certification, icon: <Award className="h-4 w-4" />, desc: analysis.profile.certifications.slice(0, 2).join(', ') },
                    { label: 'Industry Readiness', score: analysis.readiness.industry, icon: <Briefcase className="h-4 w-4" />, desc: analysis.profile.industryKnowledge.slice(0, 2).join(', ') },
                  ].map((r, i) => (
                    <GlassCard key={i} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-brand-cyan">{r.icon}</span>
                        <h4 className="text-xs font-bold text-white">{r.label}</h4>
                        <span className={`ml-auto text-sm font-extrabold ${r.score >= 60 ? 'text-brand-success' : r.score >= 30 ? 'text-amber-500' : 'text-brand-error'}`}>{r.score}%</span>
                      </div>
                      <ProgressBar value={r.score} label="" color={r.score >= 60 ? 'bg-brand-success' : r.score >= 30 ? 'bg-amber-500' : 'bg-brand-error'} />
                      <p className="text-[10px] text-brand-silver">{r.desc}</p>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB: Learning Path ─── */}
            {activeTab === 'roadmap' && (
              <div className="space-y-6">
                {[
                  { phase: '30-Day Sprint', period: 'Month 1', skills: analysis.priority.filter(p => p.difficulty === 'Easy').slice(0, 3), color: 'border-brand-success', bg: 'bg-brand-success' },
                  { phase: '90-Day Foundation', period: 'Months 1-3', skills: analysis.priority.filter(p => p.difficulty === 'Medium').slice(0, 4), color: 'border-amber-500', bg: 'bg-amber-500' },
                  { phase: '180-Day Mastery', period: 'Months 3-6', skills: analysis.priority.filter(p => p.difficulty === 'Hard').slice(0, 3), color: 'border-brand-error', bg: 'bg-brand-error' },
                ].map((phase, pIdx) => (
                  <GlassCard key={pIdx} className="space-y-4">
                    <div className={`flex items-center gap-3 border-b border-brand-border pb-3`}>
                      <div className={`h-3 w-3 rounded-full ${phase.bg}`} />
                      <div>
                        <h3 className="text-xs font-bold text-white">{phase.phase}</h3>
                        <p className="text-[10px] text-brand-silver">{phase.period}</p>
                      </div>
                    </div>
                    {phase.skills.length > 0 ? (
                      <div className="space-y-2">
                        {phase.skills.map((s, i) => (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border-l-2 ${phase.color} bg-white/5`}>
                            <GraduationCap className="h-4 w-4 text-brand-cyan shrink-0" />
                            <div className="flex-1">
                              <div className="text-xs font-bold text-white">{s.skill}</div>
                              <div className="text-[10px] text-brand-silver">{s.resource} • ~{s.timeWeeks} weeks</div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              s.difficulty === 'Easy' ? 'bg-brand-success/15 text-brand-success' :
                              s.difficulty === 'Medium' ? 'bg-amber-500/15 text-amber-500' : 'bg-brand-error/15 text-brand-error'
                            }`}>{s.difficulty}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-brand-silver text-center py-3">No skills in this difficulty tier — great progress!</div>
                    )}
                  </GlassCard>
                ))}
              </div>
            )}

            {/* ─── TAB: Resources ─── */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                {/* Certifications */}
                <GlassCard className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-brand-border pb-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-white">Recommended Certifications</h3>
                  </div>
                  <div className="space-y-2">
                    {analysis.profile.certifications.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                        <Award className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-semibold text-white">{c}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Tools */}
                <GlassCard className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-brand-border pb-2">
                    <Zap className="h-4 w-4 text-brand-cyan" />
                    <h3 className="text-xs font-bold text-white">Essential Tools</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.profile.tools.map((t, i) => {
                      const has = userProfile.skills.some(s => s.toLowerCase() === t.toLowerCase());
                      return (
                        <span key={i} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${
                          has ? 'bg-brand-success/10 border-brand-success/20 text-brand-success' : 'bg-white/5 border-white/10 text-brand-silver'
                        }`}>{has ? '✓' : '○'} {t}</span>
                      );
                    })}
                  </div>
                </GlassCard>

                {/* Industry Knowledge */}
                <GlassCard className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-brand-border pb-2">
                    <Briefcase className="h-4 w-4 text-brand-indigo" />
                    <h3 className="text-xs font-bold text-white">Industry Knowledge Required</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.profile.industryKnowledge.map((k, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-brand-indigo/10 border border-brand-indigo/20 text-brand-cyan">{k}</span>
                    ))}
                  </div>
                </GlassCard>

                {/* Learning resources by missing skill */}
                {analysis.priority.length > 0 && (
                  <GlassCard className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-brand-border pb-2">
                      <BookOpen className="h-4 w-4 text-brand-success" />
                      <h3 className="text-xs font-bold text-white">Suggested Learning Resources</h3>
                    </div>
                    <div className="space-y-2">
                      {analysis.priority.slice(0, 5).map((p, i) => (
                        <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <div className="text-xs font-bold text-white mb-1">{p.skill}</div>
                          <div className="text-[10px] text-brand-silver space-y-0.5">
                            <div>📚 Course: {p.resource}</div>
                            <div>📖 Book: "Mastering {p.skill}" (O'Reilly / Manning)</div>
                            <div>🎥 YouTube: "{p.skill} Complete Tutorial"</div>
                            <div>⏱ Estimated time: {p.timeWeeks} weeks</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
