-- Add email verification columns to organizations table
-- Run: supabase db query --linked --file scripts/add-email-verification.sql

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_code TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMPTZ;

-- Mark all existing orgs as verified (they signed up before verification was required)
UPDATE organizations SET verified = true WHERE verified IS NULL OR verified = false;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
