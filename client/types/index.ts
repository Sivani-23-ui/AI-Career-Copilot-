export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  degree: string;
  yearOfStudy: string;
  selectedCareer: string;
  skills: string[];
  careerReadinessScore: number;
}

export interface ResumeAnalysis {
  id?: string;
  education: string[];
  skills: string[];
  experience: string[];
  projects: string[];
  certifications: string[];
  strengths: string[];
  missingSkills: string[];
  suggestions: string[];
  overallScore: number;
}

export interface CareerRecommendation {
  careerName: string;
  whySuitable: string;
  requiredSkills: string[];
  currentMatch: number;
  missingSkills: string[];
  nextSteps: string[];
}

export interface SkillGapAnalysis {
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  beginner: string[];
  intermediate: string[];
  advanced: string[];
  suggestions: string[];
}

export interface RoadmapTask {
  _id?: string;
  weekNumber: number;
  title: string;
  description: string;
  topics: string[];
  practiceProblems: string[];
  miniProject: string;
  resources: string[];
  completed: boolean;
  completedAt?: string;
}

export interface Roadmap {
  _id: string;
  career: string;
  experienceLevel: string;
  studyHoursPerWeek: number;
  totalWeeks: number;
  tasks: RoadmapTask[];
  overallProgress: number;
  currentWeek: number;
}

export interface Course {
  title: string;
  skill: string;
  difficulty: string;
  duration: string;
  url: string;
  platform: string;
}

export interface InterviewFeedback {
  score: number;
  evaluation: string;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
}

export interface Interview {
  id: string;
  career: string;
  difficulty: string;
  currentQuestion: { number: number; question: string } | null;
  totalQuestions: number;
}

export interface FinalFeedback {
  overallPerformance: string;
  topStrengths: string[];
  areasToImprove: string[];
  recommendedResources: string[];
}
