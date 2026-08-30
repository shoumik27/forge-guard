export type CapabilityCategory = 'private_data' | 'untrusted_content' | 'external_communication' | 'utility';

export interface MCPToolDefinition {
  id: string;
  name: string;
  description: string;
  category: CapabilityCategory;
  schemaHash: string;
  parameters: Record<string, any>;
}

export interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  tools: MCPToolDefinition[];
}

export interface TrifectaAnalysisResult {
  agentId: string;
  isLethalTrifecta: boolean;
  score: number; // 0 to 100
  categoriesDetected: CapabilityCategory[];
  breakdown: {
    hasPrivateData: boolean;
    hasUntrustedContent: boolean;
    hasExternalComm: boolean;
  };
  schemaIntegrityValid: boolean;
  tamperedTools: string[];
  riskSummary: string;
  governanceAction: 'BLOCKED_PENDING_APPROVAL' | 'ALLOW_AUTOMATIC';
}

export interface DetonationLog {
  timestamp: string;
  phase: 'INGEST' | 'PROCESS' | 'TRIGGER' | 'CONTAINMENT' | 'EXFILTRATION';
  message: string;
  isThreat: boolean;
  payload?: string;
}

export interface DetonationResult {
  agentName: string;
  status: 'EXPLOITED' | 'CONTAINED';
  logs: DetonationLog[];
  exfiltratedData?: string;
}