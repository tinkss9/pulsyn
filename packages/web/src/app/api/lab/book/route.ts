import { NextRequest, NextResponse } from 'next/server';

// In-memory store (replace with database in production)
const bookings: Map<string, {
  id: string;
  userId: string;
  displayName: string;
  category: string;
  sourceEngine: string;
  targetEngine: string;
  slotTime: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName, category, sourceEngine, targetEngine, slotTime } = body;

    // Validation
    if (!displayName || !category || !sourceEngine || !targetEngine || !slotTime) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['rows', 'tools', 'multi'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate engines
    const validEngines = ['PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'MongoDB', 'Snowflake', 'BigQuery'];
    if (!validEngines.includes(sourceEngine) || !validEngines.includes(targetEngine)) {
      return NextResponse.json(
        { error: 'Invalid engine' },
        { status: 400 }
      );
    }

    // Check slot availability (simplified)
    const slotHour = parseInt(slotTime.split(':')[0]);
    if (slotHour < 0 || slotHour > 23) {
      return NextResponse.json(
        { error: 'Invalid time slot' },
        { status: 400 }
      );
    }

    // Create booking
    const bookingId = `lab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const booking = {
      id: bookingId,
      userId: `user-${Math.random().toString(36).slice(2, 8)}`,
      displayName,
      category,
      sourceEngine,
      targetEngine,
      slotTime,
      status: 'confirmed' as const,
      createdAt: new Date().toISOString(),
    };

    bookings.set(bookingId, booking);

    // TODO: Send confirmation email
    // TODO: Create competition environment
    // TODO: Reserve infrastructure

    return NextResponse.json({
      success: true,
      message: 'Lab session booked successfully',
      data: {
        bookingId: booking.id,
        displayName: booking.displayName,
        category: booking.category,
        sourceEngine: booking.sourceEngine,
        targetEngine: booking.targetEngine,
        slotTime: booking.slotTime,
        status: booking.status,
        sessionUrl: `/lab/${bookingId}`,
      },
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    total: bookings.size,
    bookings: Array.from(bookings.values()).map(b => ({
      id: b.id,
      displayName: b.displayName,
      category: b.category,
      slotTime: b.slotTime,
      status: b.status,
    })),
  });
}
