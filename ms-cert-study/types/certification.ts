export interface CertMetadata {
  id: string;           // código em minúsculo: "ai-900"
  examCode: string;     // código original: "AI-900"
  name: string;         // "Azure AI Fundamentals"
  fullName: string;     // "Microsoft Certified: Azure AI Fundamentals"
  product: string;      // "Azure" | "Microsoft 365" | "GitHub" | "Power Platform" | "Dynamics 365"
  role: string;         // "AI Engineer" | "Administrator" | etc.
  level: "Beginner" | "Intermediate" | "Advanced";
  subject: string;      // "Artificial intelligence" | "Security" | etc.
  learnUrl: string;
  studyGuideUrl?: string;
}

export interface LearningObjective {
  text: string;
  weight?: string;      // "15–20%"
}

export interface Domain {
  id: string;
  certId: string;
  title: string;
  description?: string;
  weight?: string;
  objectives: string[];
  learnUrl?: string;
  videosUrl?: string;
  labUrl?: string;
}

export interface Question {
  id: string;
  certId: string;
  domainId: string;
  text: string;
  options: string[];    // sempre 4 opções
  correctIndex: number; // índice da opção correta (0-3)
  explanation: string;
}

export interface LearningPath {
  uid: string;
  title: string;
  description: string;
  url: string;
  modules?: LearningModule[];
}

export interface LearningModule {
  uid: string;
  title: string;
  description: string;
  url: string;
  durationInMinutes?: number;
}

export type CertLevel = "Beginner" | "Intermediate" | "Advanced";

export interface CatalogFilters {
  product?: string;
  level?: CertLevel;
  role?: string;
  subject?: string;
  search?: string;
}
