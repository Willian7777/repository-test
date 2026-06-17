import type { UserProgress, CertProgress, DomainScore, ExamResult } from "@/types/progress";

const STORAGE_KEY = "ms-cert-study-progress";

function getProgress(): UserProgress {
  if (typeof window === "undefined") {
    return { myCertIds: [], certProgress: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { myCertIds: [], certProgress: {} };
    return JSON.parse(raw) as UserProgress;
  } catch {
    return { myCertIds: [], certProgress: {} };
  }
}

function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getMyCerts(): string[] {
  return getProgress().myCertIds;
}

export function hasCert(certId: string): boolean {
  return getProgress().myCertIds.includes(certId);
}

export function addCert(certId: string): void {
  const progress = getProgress();
  if (!progress.myCertIds.includes(certId)) {
    progress.myCertIds.push(certId);
    if (!progress.certProgress[certId]) {
      progress.certProgress[certId] = {
        certId,
        addedAt: new Date().toISOString(),
        domainScores: [],
        examScores: [],
      };
    }
    saveProgress(progress);
  }
}

export function removeCert(certId: string): void {
  const progress = getProgress();
  progress.myCertIds = progress.myCertIds.filter((id) => id !== certId);
  saveProgress(progress);
}

export function addMultipleCerts(certIds: string[]): void {
  certIds.forEach((id) => addCert(id));
}

export function getCertProgress(certId: string): CertProgress | null {
  return getProgress().certProgress[certId] ?? null;
}

export function saveDomainScore(certId: string, score: Omit<DomainScore, "lastPracticed">): void {
  const progress = getProgress();
  if (!progress.certProgress[certId]) {
    addCert(certId);
    return saveDomainScore(certId, score);
  }

  const cert = progress.certProgress[certId];
  const existing = cert.domainScores.findIndex((d) => d.domainId === score.domainId);
  const updated: DomainScore = { ...score, lastPracticed: new Date().toISOString() };

  if (existing >= 0) {
    cert.domainScores[existing] = updated;
  } else {
    cert.domainScores.push(updated);
  }

  saveProgress(progress);
}

export function saveExamResult(certId: string, result: Omit<ExamResult, "date">): void {
  const progress = getProgress();
  if (!progress.certProgress[certId]) {
    addCert(certId);
    return saveExamResult(certId, result);
  }

  progress.certProgress[certId].examScores.push({
    ...result,
    date: new Date().toISOString(),
  });

  saveProgress(progress);
}

export function getCertOverallScore(certId: string): number | null {
  const cert = getProgress().certProgress[certId];
  if (!cert || cert.examScores.length === 0) return null;
  const last = cert.examScores[cert.examScores.length - 1];
  return last.score;
}

// Verifica se a cert foi "aprovada" (score >= 700 na escala Microsoft)
export function isCertPassed(certId: string): boolean {
  const score = getCertOverallScore(certId);
  return score !== null && score >= 700;
}

export function getTrailProgressStatus(certIds: string[]): {
  done: string[];
  inProgress: string[];
  locked: string[];
} {
  const myCerts = getMyCerts();
  const done: string[] = [];
  const inProgress: string[] = [];
  const locked: string[] = [];

  for (const certId of certIds) {
    if (isCertPassed(certId)) {
      done.push(certId);
    } else if (myCerts.includes(certId)) {
      inProgress.push(certId);
    } else {
      locked.push(certId);
    }
  }

  return { done, inProgress, locked };
}
