export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  detailedDescription: string;
  architectureThemes: string[];
  visualScene: string;
  statusBadge?: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface EducationItem {
  institution: string;
  location: string;
  degree: string;
  period: string;
  score: string;
}

export interface CertificationItem {
  title: string;
  issuer: string;
}

export interface ExperienceItem {
  period: string;
  role: string;
  organization: string;
  highlights: string[];
}

export interface PortfolioData {
  identity: {
    name: string;
    role: string;
    introduction: string;
    status: string;
  };
  projects: Project[];
  skills: SkillCategory[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  contact: {
    name: string;
    email: string;
    phone: string;
    phoneDisplay: string;
    instagram: string;
    instagramHandle: string;
    github: string;
    githubUsername: string;
    linkedin: string;
  };
}
