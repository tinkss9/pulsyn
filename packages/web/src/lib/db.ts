import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    _client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

export interface QueryResult {
  rows: any[];
  rowCount: number;
}

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const { data, error } = await getClient().rpc('_pulsyn_exec', {
    sql: text,
    params: params?.map(p => {
      if (p === null || p === undefined) return null;
      if (typeof p === 'object') return JSON.stringify(p);
      return String(p);
    }) || [],
  });

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  const rows = Array.isArray(data) ? data : (data ? [data] : []);
  return { rows, rowCount: rows.length };
}
