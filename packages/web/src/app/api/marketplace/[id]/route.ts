// Marketplace API — Get connector details, install, review
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/marketplace/[id] — Get connector details with reviews
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const connResult = await query(
      `SELECT * FROM marketplace_connectors WHERE id = $1 AND is_published = true`,
      [id]
    );
    if (connResult.rowCount === 0) {
      return NextResponse.json(
        { error: `Marketplace connector "${id}" not found`, code: 'CONNECTOR_NOT_FOUND' },
        { status: 404 }
      );
    }

    const reviewsResult = await query(
      `SELECT id, user_id, rating, title, review_text, is_verified_purchase, helpful_count, created_at
       FROM marketplace_reviews WHERE connector_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [id]
    );

    return NextResponse.json({
      data: connResult.rows[0],
      reviews: reviewsResult.rows,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to fetch connector details: ${err.message}`, code: 'CONNECTOR_FETCH_FAILED' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/[id]/install — Install a connector
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body', code: 'INVALID_JSON' },
      { status: 400 }
    );
  }

  const { organizationId } = body;
  if (!organizationId) {
    return NextResponse.json(
      { error: 'Missing required field: organizationId', code: 'MISSING_FIELD' },
      { status: 400 }
    );
  }

  try {
    const connResult = await query(
      `SELECT * FROM marketplace_connectors WHERE id = $1 AND is_published = true`,
      [id]
    );
    if (connResult.rowCount === 0) {
      return NextResponse.json(
        { error: `Marketplace connector "${id}" not found`, code: 'CONNECTOR_NOT_FOUND' },
        { status: 404 }
      );
    }

    const connector = connResult.rows[0];

    // Check if already installed
    const existing = await query(
      `SELECT id FROM marketplace_installations WHERE connector_id = $1 AND organization_id = $2`,
      [id, organizationId]
    );
    if (existing.rowCount > 0) {
      return NextResponse.json(
        { error: `Connector "${id}" is already installed for organization "${organizationId}"`, code: 'ALREADY_INSTALLED' },
        { status: 409 }
      );
    }

    // Install
    const installId = `inst-${Date.now()}`;
    const installData = JSON.stringify({
      id: installId,
      connector_id: id,
      organization_id: organizationId,
      installed_version: connector.version,
      config: connector.config_template || {},
    });

    await query(
      `INSERT INTO marketplace_installations (id, connector_id, organization_id, installed_version, config)
       SELECT i->>'id', i->>'connector_id', i->>'organization_id', i->>'installed_version', (i->'config')::jsonb
       FROM (SELECT $1::jsonb AS i) sub`,
      [installData]
    );

    // Increment download count
    await query(
      `UPDATE marketplace_connectors SET download_count = download_count + 1 WHERE id = $1`,
      [id]
    );

    return NextResponse.json({
      data: {
        installationId: installId,
        connector: {
          id: connector.id,
          name: connector.name,
          engine: connector.engine,
          configTemplate: connector.config_template,
        },
        message: `Installed ${connector.name}. Create a connector using the config template.`,
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to install connector: ${err.message}`, code: 'INSTALL_FAILED' },
      { status: 500 }
    );
  }
}
