export type ResourceType = "youtube" | "link" | "file";

export interface UserResource {
  id: string;
  certId: string;
  domainId: string;
  type: ResourceType;
  title: string;
  // youtube ou link
  url?: string;
  // file
  fileData?: string;   // base64 data URL
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  addedAt: string;
}
