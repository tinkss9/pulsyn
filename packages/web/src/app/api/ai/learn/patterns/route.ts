// GET /api/ai/learn/patterns — Get learned patterns
import { NextRequest, NextResponse } from 'next/server';
import { getLearningEngine } from '@/lib/ai/learning-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');
    const patternType = searchParams.get('patternType') ?? undefined;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Missing required query param: orgId' },
        { status: 400 }
      );
    }

    const engine = getLearningEngine();
    const patterns = await engine.getPatterns(orgId, patternType);

    return NextResponse.json({
      data: {
        orgId,
        patternType: patternType ?? 'all',
        count: patterns.length,
        patterns,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
