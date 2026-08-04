// POST /api/ai/learn/snapshot — Record a learning snapshot
import { NextRequest, NextResponse } from 'next/server';
import { getLearningEngine } from '@/lib/ai/learning-engine';

export async function POST(req: NextRequest) {
  try {
    const { orgId, resourceType, resourceId, metrics } = await req.json();

    if (!orgId || !resourceType || !resourceId || !metrics) {
      return NextResponse.json(
        { error: 'Missing required fields: orgId, resourceType, resourceId, metrics' },
        { status: 400 }
      );
    }

    const engine = getLearningEngine();
    const snapshotId = await engine.recordSnapshot({
      orgId,
      resourceType,
      resourceId,
      metrics,
    });

    return NextResponse.json({
      data: {
        snapshotId,
        status: 'recorded',
        recordedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
