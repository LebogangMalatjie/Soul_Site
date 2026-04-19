export type AppPhase = 'terminal' | 'river' | 'gate' | 'hub';

export interface ChatMessage {
  id: string;
  codename: string;
  content: string;
  timestamp: number;
  type: 'normal' | 'sos' | 'system' | 'admin';
  replyTo?: string;
}

export interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadTime: number;
  extractionCode: string;
  content?: string; // base64 for images
}

export interface OnlineUser {
  codename: string;
  joinTime: number;
  isAdmin: boolean;
  lastActive: number;
}

export interface HubState {
  codename: string;
  isAdmin: boolean;
  messages: ChatMessage[];
  files: SharedFile[];
  onlineUsers: OnlineUser[];
  sosActive: boolean;
}

export interface AdminSettings {
  accessCode: string;
  maxUsers: number;
  allowUploads: boolean;
  allowDownloads: boolean;
  requireCodename: boolean;
}

export const DEFAULT_ACCESS_CODE = 'VEILED42';
export const ADMIN_CODE = 'ADMIN_007';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const generateExtractionCode = (): string => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

export const formatTimestamp = (timestamp: number): string => {
  const d = new Date(timestamp);
  return `[${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}]`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};
