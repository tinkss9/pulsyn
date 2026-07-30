import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data: [], total: 0, message: 'CDC engines are managed per-pipeline via /api/cdc/start and /api/cdc/stop' });
}
