-- Add verified column to organizations for email verification
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_code TEXT;

-- Mark all existing orgs as verified (they signed up before verification was required)
UPDATE organizations SET verified = true WHERE verified IS NULL OR verified = false;

NOTIFY pgrst, 'reload schema';
