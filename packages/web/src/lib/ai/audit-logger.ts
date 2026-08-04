// Production audit logger — logs every AI request to Supabase
import { query } from '@/lib/db';

export interface AuditLogEntry {
  apiKeyHash: string;
  orgId?: string;
  messageLength: number;
  hasRagContext: boolean;
  llmProvider?: string;
  llmModel?: string;
  llmTokensIn?: number;
  llmTokensOut?: number;
  llmLatencyMs?: number;
  confidence?: number;
  error?: string;
  ipAddress?: string;
  userAgent?: string;
}

function hashKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return `rl-${Math.abs(hash).toString(36)}`;
}

export async function logRequest(entry: AuditLogEntry): Promise<void> {
  try {
    await query(
      `INSERT INTO ai_request_log
       (api_key_hash, org_id, message_length, has_rag_context, llm_provider, llm_model,
        llm_tokens_in, llm_tokens_out, llm_latency_ms, confidence, error, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        entry.apiKeyHash,
        entry.orgId ?? null,
        entry.messageLength,
        entry.hasRagContext,
        entry.llmProvider ?? null,
        entry.llmModel ?? null,
        entry.llmTokensIn ?? 0,
        entry.llmTokensOut ?? 0,
        entry.llmLatencyMs ?? 0,
        entry.confidence ?? null,
        entry.error ?? null,
        entry.ipAddress ?? null,
        entry.userAgent ?? null,
      ]
    );
  } catch (err) {
    // Audit logging should never break the request
    console.error('[AuditLogger] Failed to log:', err);
  }
}

export { hashKey };
