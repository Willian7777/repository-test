import type { UserResource } from "@/types/resource";

const storageKey = (certId: string, domainId: string) =>
  `ms-cert-resources::${certId}::${domainId}`;

export function getResources(certId: string, domainId: string): UserResource[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(certId, domainId));
    return raw ? (JSON.parse(raw) as UserResource[]) : [];
  } catch {
    return [];
  }
}

export function addResource(resource: UserResource): void {
  if (typeof window === "undefined") return;
  const current = getResources(resource.certId, resource.domainId);
  current.push(resource);
  localStorage.setItem(storageKey(resource.certId, resource.domainId), JSON.stringify(current));
}

export function deleteResource(certId: string, domainId: string, id: string): void {
  if (typeof window === "undefined") return;
  const current = getResources(certId, domainId);
  const updated = current.filter((r) => r.id !== id);
  localStorage.setItem(storageKey(certId, domainId), JSON.stringify(updated));
}

export function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match?.[1] ?? null;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
