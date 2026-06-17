export interface DomainScore {
  domainId: string;
  certId: string;
  totalQuestions: number;
  correctAnswers: number;
  lastPracticed: string; // ISO date
}

export interface CertProgress {
  certId: string;
  addedAt: string;       // ISO date
  domainScores: DomainScore[];
  examScores: ExamResult[];
}

export interface ExamResult {
  date: string;          // ISO date
  score: number;         // 0–1000, aprovado >= 700
  totalQuestions: number;
  correctAnswers: number;
  breakdown: { domainId: string; correct: number; total: number }[];
}

export interface UserProgress {
  myCertIds: string[];
  certProgress: Record<string, CertProgress>; // certId → CertProgress
}
