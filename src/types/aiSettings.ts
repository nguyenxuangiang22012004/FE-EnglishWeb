export interface AdminAiKeyDTO {
  id: string;
  keyName: string;
  maskedKey: string;
  active: boolean;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminAiKeyRequest {
  keyName: string;
  apiKey: string;
  isActive?: boolean;
}

export interface UpdateAdminAiKeyRequest {
  keyName?: string;
  apiKey?: string;
  isActive?: boolean;
}

export interface AiKeyTestResponse {
  success: boolean;
  message: string;
  testedModel: string;
  latencyMs: number;
}

export interface AdminAiStatsDTO {
  totalAdminKeys: number;
  activeAdminKeys: number;
  totalTrialDevices: number;
  totalTrialPromptsUsed: number;
  usageByFeature: Record<string, number>;
}

export interface UserAiSettingDTO {
  hasApiKey: boolean;
  maskedApiKey: string | null;
  preferredModel: string;
  apiKey: string | null;
  updatedAt: string | null;
}

export interface TrialConsumeResponse {
  allowed: boolean;
  remainingTrialCount: number;
  maxTrialCount: number;
  trialApiKey: string | null;
  preferredModel: string;
  message: string;
}
