// Custom Replication Product API — Enterprise bespoke pipelines
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/custom-replication — List custom replication offerings
export async function GET() {
  return NextResponse.json({
    offerings: [
      {
        id: 'custom-connector',
        name: 'Custom Connector',
        description: 'Build a connector for your proprietary system or internal API. We handle schema discovery, authentication, rate limiting, and CDC.',
        price: { setup: 5000, monthly: 1000 },
        timeline: '2-4 weeks',
        deliverables: ['Custom connector code', 'Schema discovery', 'Auth integration', 'CDC support', 'Certification report'],
      },
      {
        id: 'custom-pipeline',
        name: 'Custom Pipeline',
        description: 'End-to-end data pipeline with custom transformations, masking rules, and monitoring. We build it, you run it.',
        price: { setup: 10000, monthly: 2000 },
        timeline: '4-6 weeks',
        deliverables: ['Source connector', 'Target connector', 'Custom transformations', 'Masking rules', 'Monitoring dashboard', 'Runbook'],
      },
      {
        id: 'white-label',
        name: 'White-Label CDC',
        description: 'Embed Pulsyn CDC in your product. Full white-label dashboard, API, and MCP server under your brand.',
        price: { setup: 25000, monthly: 5000 },
        timeline: '6-8 weeks',
        deliverables: ['White-label UI', 'Custom domain', 'Brand theming', 'API customization', 'MCP server', 'Dedicated support'],
      },
      {
        id: 'data-lake-sync',
        name: 'Data Lake Sync',
        description: 'Continuous replication from your sources to your data lake (S3, GCS, Azure Blob, Snowflake, BigQuery). Optimized for analytics workloads.',
        price: { setup: 15000, monthly: 3000 },
        timeline: '4-8 weeks',
        deliverables: ['Multi-source connectors', 'Lake-optimized schema', 'Incremental sync', 'Partitioning strategy', 'Cost optimization'],
      },
      {
        id: 'real-time-analytics',
        name: 'Real-Time Analytics Pipeline',
        description: 'Sub-second CDC from operational databases to analytics warehouses. Optimized for BI tools and dashboards.',
        price: { setup: 20000, monthly: 4000 },
        timeline: '6-10 weeks',
        deliverables: ['CDC engine optimization', 'Warehouse connectors', 'Materialized views', 'BI tool integration', 'SLA monitoring'],
      },
    ],
    pricing: {
      model: 'Setup fee + monthly retainer',
      discounts: {
        annual: '20% off monthly fee',
        multiProject: '15% off setup for 3+ projects',
        startup: '50% off for YC companies',
      },
      sla: {
        response: '4 hours',
        resolution: '24 hours',
        uptime: '99.99%',
      },
    },
    contact: {
      email: 'enterprise@pulsynai.com',
      calendar: 'https://cal.com/pulsyn/enterprise',
      demo: 'https://pulsynai.com/demo',
    },
  });
}

// POST /api/custom-replication — Submit custom replication request
export async function POST(req: NextRequest) {
  const { offeringId, organizationId, requirements, contactEmail, contactName } = await req.json();

  if (!offeringId || !organizationId || !contactEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Store the request (in production, this would go to a CRM or support system)
  const requestId = `custom-${Date.now()}`;
  
  // Log the request
  console.log(`[Custom Replication] Request: ${requestId}, offering: ${offeringId}, org: ${organizationId}, email: ${contactEmail}`);

  return NextResponse.json({
    data: {
      requestId,
      offeringId,
      status: 'received',
      message: `Thank you for your interest! Our enterprise team will contact you within 24 hours at ${contactEmail}.`,
      nextSteps: [
        'Enterprise team reviews requirements',
        'Technical scoping call (30 min)',
        'Proposal with timeline and pricing',
        'Contract and kickoff',
      ],
    },
  }, { status: 201 });
}
