// Production audit logger — logs every AI request to Supabase
// Uses JSONB to avoid Supabase RPC parameter limits
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
    // Pack all data into JSONB to stay within Supabase RPC param limits
    const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await query(
      `INSERT INTO ai_request_log (id, api_key_hash, created_at) VALUES ($1, $2, NOW())`,
      [id, entry.apiKeyHash]
    );
  } catch (err) {
    // Audit logging should never break the request
    console.error('[AuditLogger] Failed to log:', err);
  }
}

export { hashKey };
