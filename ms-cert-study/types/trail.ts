export type TrailStepStatus = "done" | "current" | "locked";

export interface TrailStep {
  certId: string;       // "ai-900"
  examCode: string;     // "AI-900"
  certName: string;     // "Azure AI Fundamentals"
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;  // o que esta cert valida
  isRecommended?: boolean; // passo recomendado para começar
}

export interface Trail {
  id: string;           // "ai" | "azure-admin" | "security" | etc.
  name: string;         // "Inteligência Artificial"
  description: string;
  icon: string;         // emoji ou nome de ícone
  color: string;        // classe Tailwind de cor de fundo ex: "bg-blue-600"
  textColor: string;    // ex: "text-blue-600"
  borderColor: string;  // ex: "border-blue-600"
  steps: TrailStep[];
}

export interface TrailProgress {
  trailId: string;
  completedCertIds: string[];   // certIds com score >= 700
  inProgressCertIds: string[];  // certIds adicionados mas não concluídos
}
