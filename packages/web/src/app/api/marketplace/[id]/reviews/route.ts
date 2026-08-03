// Marketplace API — Submit reviews
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/marketplace/[id]/reviews — Submit a review
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId, rating, title, reviewText } = await req.json();

  if (!userId || !rating) {
    return NextResponse.json({ error: 'Missing userId or rating' }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
  }

  // Check connector exists
  const conn = await query('SELECT id FROM marketplace_connectors WHERE id = $1', [id]);
  if (conn.rowCount === 0) {
    return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
  }

  // Check if user already reviewed
  const existing = await query(
    'SELECT id FROM marketplace_reviews WHERE connector_id = $1 AND user_id = $2',
    [id, userId]
  );
  if (existing.rowCount > 0) {
    // Update existing review
    await query(
      `UPDATE marketplace_reviews SET rating = $1, title = $2, review_text = $3, updated_at = NOW()
       WHERE connector_id = $4 AND user_id = $5`,
      [rating, title, reviewText, id, userId]
    );
    return NextResponse.json({ message: 'Review updated' });
  }

  // New review
  const reviewId = `rev-${Date.now()}`;
  // Use JSONB to avoid 6-param limit in _pulsyn_exec
  const reviewData = JSON.stringify({ id: reviewId, connector_id: id, user_id: userId, rating, title: title || '', review_text: reviewText || '' });
  await query(
    `INSERT INTO marketplace_reviews (id, connector_id, user_id, rating, title, review_text)
     SELECT r->>'id', r->>'connector_id', r->>'user_id', (r->>'rating')::int, r->>'title', r->>'review_text'
     FROM (SELECT $1::jsonb AS r) sub`,
    [reviewData]
  );

  return NextResponse.json({ data: { reviewId, message: 'Review submitted' } }, { status: 201 });
}
