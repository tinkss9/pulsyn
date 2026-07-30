// Pulsyn Database Layer — Supabase client with pg-compatible query interface
// Uses _pulsyn_exec RPC function for raw SQL execution

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: SupabaseClient;

function getClient(): SupabaseClient {
  if (!supabase) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Set these in .env or environment variables.'
      );
    }
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabase;
}

export interface QueryResult {
  rows: any[];
  rowCount: number;
}

/**
 * Execute a parameterized SQL query via Supabase RPC.
 * Compatible interface with pg.Pool.query() so existing routes work unchanged.
 */
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const start = Date.now();
  const client = getClient();

  const { data, error } = await client.rpc('_pulsyn_exec', {
    sql: text,
    params: params?.map(p => {
      if (p === null || p === undefined) return null;
      if (typeof p === 'object') return JSON.stringify(p);
      return String(p);
    }) || [],
  });

  const duration = Date.now() - start;
  if (duration > 100) {
    console.warn(`[Pulsyn DB] Slow query (${duration}ms):`, text.substring(0, 100));
  }

  if (error) {
    console.error('[Pulsyn DB] Query error:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }

  // _pulsyn_exec returns a JSONB array of row objects
  const rows = Array.isArray(data) ? data : (data ? [data] : []);
  return { rows, rowCount: rows.length };
}

/**
 * Init database — no-op for Supabase (schema managed via migrations/SQL files).
 * Kept for backward compatibility with existing startup code.
 */
export async function initDatabase(): Promise<void> {
  console.log('[Pulsyn DB] Using Supabase — schema managed externally');
}

export default getClient;
