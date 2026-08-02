// Pulsyn Dashboard Login API
// Validates API key and returns session

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    const user = await validateApiKey(apiKey);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired API key' },
        { status: 401 }
      );
    }

    // Return user info (in production, set httpOnly cookie or JWT)
    return NextResponse.json({
      data: {
        user,
        token: apiKey, // In production, this would be a JWT
        message: 'Login successful',
      },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
