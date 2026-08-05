import { NextRequest, NextResponse } from 'next/server';

// In-memory store (replace with database in production)
const registrations: Map<string, {
  email: string;
  name: string;
  country: string;
  registeredAt: string;
  phase: string;
}> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, country } = body;

    // Validation
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check for duplicate
    if (registrations.has(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Register
    const registration = {
      email: email.toLowerCase(),
      name,
      country: country || 'Unknown',
      registeredAt: new Date().toISOString(),
      phase: 'Qualifiers',
    };

    registrations.set(email.toLowerCase(), registration);

    // TODO: Send welcome email
    // TODO: Store in database (Supabase/Postgres)
    // TODO: Create competition environment

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        name: registration.name,
        phase: registration.phase,
        registeredAt: registration.registeredAt,
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
    total: registrations.size,
    recent: Array.from(registrations.values())
      .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
      .slice(0, 10)
      .map(r => ({
        name: r.name,
        country: r.country,
        registeredAt: r.registeredAt,
      })),
  });
}
