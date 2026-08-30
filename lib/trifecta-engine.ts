import { AgentConfig, TrifectaAnalysisResult, CapabilityCategory } from './types';

// Baseline known schema hashes to detect "rug-pull" MCP tool tampering
export const KNOWN_MCP_REGISTRY_HASHES: Record<string, string> = {
  'customer-db-mcp': 'hash_v1_c9a1b8',
  'email-fetcher-mcp': 'hash_v1_f7e3d2',
  'slack-notifier-mcp': 'hash_v1_a3b9c4',
  'code-sandbox-mcp': 'hash_v1_08ef91'
};

export function analyzeAgentTrifecta(config: AgentConfig): TrifectaAnalysisResult {
  const categoriesDetected = new Set<CapabilityCategory>();
  const tamperedTools: string[] = [];

  for (const tool of config.tools) {
    categoriesDetected.add(tool.category);

    // Schema Drift / Tampering check
    const expectedHash = KNOWN_MCP_REGISTRY_HASHES[tool.id];
    if (expectedHash && expectedHash !== tool.schemaHash) {
      tamperedTools.push(tool.name);
    }
  }

  const hasPrivateData = categoriesDetected.has('private_data');
  const hasUntrustedContent = categoriesDetected.has('untrusted_content');
  const hasExternalComm = categoriesDetected.has('external_communication');

  const isLethalTrifecta = hasPrivateData && hasUntrustedContent && hasExternalComm;
  const schemaIntegrityValid = tamperedTools.length === 0;

  let score = 0;
  if (hasPrivateData) score += 30;
  if (hasUntrustedContent) score += 30;
  if (hasExternalComm) score += 30;
  if (isLethalTrifecta) score += 10;
  if (!schemaIntegrityValid) score = 100;

  let riskSummary = 'Low risk profile. Tools operate in isolation.';
  if (isLethalTrifecta) {
    riskSummary = 'CRITICAL: Lethal Trifecta Active. Agent connects untrusted input directly with private records and outbound exfiltration.';
  } else if (!schemaIntegrityValid) {
    riskSummary = `CRITICAL: Schema drift detected in MCP tools: ${tamperedTools.join(', ')}. Possible upstream supply-chain compromise.`;
  }

  return {
    agentId: config.id,
    isLethalTrifecta,
    score,
    categoriesDetected: Array.from(categoriesDetected),
    breakdown: {
      hasPrivateData,
      hasUntrustedContent,
      hasExternalComm,
    },
    schemaIntegrityValid,
    tamperedTools,
    riskSummary,
    governanceAction: (isLethalTrifecta || !schemaIntegrityValid) ? 'BLOCKED_PENDING_APPROVAL' : 'ALLOW_AUTOMATIC'
  };
}