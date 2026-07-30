// Pulsyn Authentication Routes
// Login, signup, API key management

import { Router, Request, Response } from 'express';
import { query } from '../db';
import crypto from 'crypto';

export const authRoutes = Router();

/**
 * POST /api/auth/signup
 * Create a new organization and generate API key
 */
authRoutes.post('/signup', async (req: Request, res: Response) => {
  const { email, name, company } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Check if email already exists
    const existing = await query(
      'SELECT id FROM organizations WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered. Use login instead.' });
    }

    // Create organization
    const orgId = `org-${crypto.randomUUID()}`;
    await query(
      `INSERT INTO organizations (id, name, email, company, plan_id, created_at)
       VALUES ($1, $2, $3, $4, 'community', NOW())`,
      [orgId, name, email, company || null]
    );

    // Generate API key
    const apiKey = `pulsyn_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyId = `key-${crypto.randomUUID()}`;

    await query(
      `INSERT INTO api_keys (id, organization_id, key_hash, name, plan_id, is_active, created_at)
       VALUES ($1, $2, $3, 'Default Key', 'community', true, NOW())`,
      [keyId, orgId, keyHash]
    );

    res.status(201).json({
      data: {
        organizationId: orgId,
        apiKey,
        plan: 'community',
        message: 'Account created. Save your API key — it cannot be retrieved later.',
      },
    });
  } catch (err) {
    console.error('[Auth] Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

/**
 * POST /api/auth/login
 * Validate API key and return organization info
 */
authRoutes.post('/login', async (req: Request, res: Response) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  try {
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const result = await query(
      `SELECT ak.id, ak.organization_id, ak.plan_id, ak.is_active, ak.expires_at,
              o.name, o.email, o.company
       FROM api_keys ak
       JOIN organizations o ON o.id = ak.organization_id
       WHERE ak.key_hash = $1 AND ak.is_active = true`,
      [keyHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const record = result.rows[0];

    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      return res.status(401).json({ error: 'API key has expired' });
    }

    res.json({
      data: {
        organizationId: record.organization_id,
        name: record.name,
        email: record.email,
        company: record.company,
        plan: record.plan_id,
      },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * POST /api/auth/keys
 * Generate a new API key for an organization
 */
authRoutes.post('/keys', async (req: Request, res: Response) => {
  const { organizationId, name } = req.body;

  if (!organizationId) {
    return res.status(400).json({ error: 'Organization ID is required' });
  }

  try {
    const apiKey = `pulsyn_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyId = `key-${crypto.randomUUID()}`;

    await query(
      `INSERT INTO api_keys (id, organization_id, key_hash, name, is_active, created_at)
       VALUES ($1, $2, $3, $4, true, NOW())`,
      [keyId, organizationId, keyHash, name || 'API Key']
    );

    res.status(201).json({
      data: {
        keyId,
        apiKey,
        name: name || 'API Key',
        message: 'Save your API key — it cannot be retrieved later.',
      },
    });
  } catch (err) {
    console.error('[Auth] Key generation error:', err);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

/**
 * GET /api/auth/keys/:orgId
 * List API keys for an organization (without revealing key values)
 */
authRoutes.get('/keys/:orgId', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, name, is_active, created_at, last_used_at, expires_at
       FROM api_keys
       WHERE organization_id = $1
       ORDER BY created_at DESC`,
      [req.params.orgId]
    );

    res.json({ data: result.rows });
  } catch (err) {
    console.error('[Auth] Key list error:', err);
    res.status(500).json({ error: 'Failed to list API keys' });
  }
});

/**
 * DELETE /api/auth/keys/:keyId
 * Revoke an API key
 */
authRoutes.delete('/keys/:keyId', async (req: Request, res: Response) => {
  try {
    await query(
      'UPDATE api_keys SET is_active = false WHERE id = $1',
      [req.params.keyId]
    );
    res.json({ message: 'API key revoked' });
  } catch (err) {
    console.error('[Auth] Key revocation error:', err);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});
