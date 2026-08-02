// Pulsyn Dashboard Authentication
// Uses API key validation against the Pulsyn API

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  plan: string;
}

export async function validateApiKey(apiKey: string): Promise<AuthUser | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  // Hash the API key
  const crypto = await import('crypto');
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Look up the key
  const { data, error } = await supabase
    .from('api_keys')
    .select(`
      id,
      organization_id,
      plan_id,
      is_active,
      expires_at,
      organizations!inner (
        id,
        name,
        email,
        company
      )
    `)
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  const org = data.organizations as any;

  return {
    id: data.id,
    email: org.email,
    name: org.name,
    organizationId: data.organization_id,
    plan: data.plan_id || 'community',
  };
}

export async function validateSession(sessionToken: string): Promise<AuthUser | null> {
  // For now, session tokens are API keys
  // In production, this would validate JWT sessions
  return validateApiKey(sessionToken);
}
