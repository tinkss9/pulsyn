// GET /api/ai/learn/history — Get learning snapshot history
import { NextRequest, NextResponse } from 'next/server';
import { getLearningEngine } from '@/lib/ai/learning-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const resourceType = searchParams.get('resourceType');
    const resourceId = searchParams.get('resourceId');
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30;

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'Missing required query params: resourceType, resourceId' },
        { status: 400 }
      );
    }

    const engine = getLearningEngine();
    const history = await engine.getHistory(resourceType, resourceId, days);

    return NextResponse.json({
      data: {
        resourceType,
        resourceId,
        days,
        count: history.length,
        snapshots: history,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
