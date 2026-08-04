// POST /api/ai/chat — Production AI chat endpoint
// Features: rate limiting, spending limits, audit logging, injection protection, SSE streaming
import { NextRequest } from 'next/server';
import { chat, type ChatMessage } from '@/lib/ai/llm-client';
import { answerQuestion } from '@/lib/ai/insight-generator';
import { checkRateLimit } from '@/lib/ai/rate-limiter';
import { checkSpendingLimit, recordSpending } from '@/lib/ai/spending-limits';
import { logRequest, hashKey } from '@/lib/ai/audit-logger';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MESSAGE_LENGTH = 4000;
const MAX_CONTEXT_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_MESSAGE_LENGTH = 2000;

// ---------------------------------------------------------------------------
// SSE helper
// ---------------------------------------------------------------------------

function sseResponse(data: string, eventName = 'message') {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const chunks = data.match(/[\s\S]{1,100}/g) ?? [data];
      for (const chunk of chunks) {
        controller.enqueue(
          encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify({ chunk })}\n\n`),
        );
      }
      controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

function sanitizeHistory(history: { role: string; content: string }[]): ChatMessage[] {
  return history
    .filter(
      (m) =>
        typeof m.content === 'string' &&
        (m.role === 'user' || m.role === 'assistant') &&
        m.content.length <= MAX_HISTORY_MESSAGE_LENGTH,
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const userAgent = req.headers.get('user-agent') ?? undefined;
  const forwarded = req.headers.get('x-forwarded-for');
  const ipAddress = forwarded?.split(',')[0]?.trim() ?? undefined;

  let apiKey = '';

  try {
    // 1. Auth
    apiKey =
      req.headers.get('x-api-key') ??
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
      '';

    if (!apiKey) {
      return errorResponse('Authentication required. Provide x-api-key or Authorization header.', 401);
    }

    // 2. Rate limiting (Supabase-backed, serverless-safe)
    const rateLimit = await checkRateLimit(apiKey);
    if (!rateLimit.allowed) {
      await logRequest({ apiKeyHash: hashKey(apiKey), messageLength: 0, hasRagContext: false, error: 'rate_limited', ipAddress, userAgent });
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded: 30 requests per minute', resetAt: rateLimit.resetAt }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt,
            'Retry-After': '60',
          },
        }
      );
    }

    // 3. Spending limits (per-org cost caps)
    const spending = await checkSpendingLimit(apiKey);
    if (!spending.allowed) {
      await logRequest({ apiKeyHash: hashKey(apiKey), messageLength: 0, hasRagContext: false, error: 'spending_limit', ipAddress, userAgent });
      return new Response(
        JSON.stringify({ error: spending.reason }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '3600' } }
      );
    }

    // 4. Parse and validate input
    const body = await req.json();
    const { message, context, conversationHistory } = body as {
      message?: string;
      context?: string;
      conversationHistory?: { role: string; content: string }[];
    };

    if (!message || typeof message !== 'string') {
      return errorResponse('Missing required field: message');
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return errorResponse(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`);
    }

    // 5. Sanitize inputs
    const history: ChatMessage[] = Array.isArray(conversationHistory)
      ? sanitizeHistory(conversationHistory)
      : [];

    const sanitizedContext =
      typeof context === 'string' && context.length > 0
        ? context.slice(0, MAX_CONTEXT_LENGTH).replace(/\b(system|assistant|ignore previous|ignore all)\b/gi, '[filtered]')
        : undefined;

    if (sanitizedContext) {
      history.unshift({ role: 'user', content: `[Additional context]\n${sanitizedContext}` });
    }

    // 6. Call LLM (with timeout + retry built into llm-client)
    const result = await answerQuestion(message, history, apiKey);
    const latencyMs = Date.now() - startTime;

    // 7. Record spending and audit log
    // Estimate tokens (rough: 1 token ≈ 4 chars)
    const tokensIn = Math.ceil(message.length / 4) + (result.sources.length > 0 ? 500 : 0);
    const tokensOut = Math.ceil(result.answer.length / 4);
    await recordSpending(apiKey, tokensIn, tokensOut);
    await logRequest({
      apiKeyHash: hashKey(apiKey),
      messageLength: message.length,
      hasRagContext: result.sources.length > 0,
      llmProvider: 'deepseek',
      llmTokensIn: tokensIn,
      llmTokensOut: tokensOut,
      llmLatencyMs: latencyMs,
      confidence: result.confidence,
      ipAddress,
      userAgent,
    });

    // 8. Return SSE response with rate limit + spending headers
    const response = sseResponse(
      JSON.stringify({
        answer: result.answer,
        sources: result.sources,
        confidence: result.confidence,
      }),
      'message',
    );
    response.headers.set('X-RateLimit-Limit', '30');
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    response.headers.set('X-RateLimit-Reset', rateLimit.resetAt);
    response.headers.set('X-Spending-Daily-Remaining', spending.dailyRemaining.toFixed(2));
    response.headers.set('X-Spending-Monthly-Remaining', spending.monthlyRemaining.toFixed(2));
    response.headers.set('X-Response-Time', `${latencyMs}ms`);
    return response;

  } catch (err: any) {
    const latencyMs = Date.now() - startTime;

    // Audit the error
    await logRequest({
      apiKeyHash: hashKey(apiKey || 'unknown'),
      messageLength: 0,
      hasRagContext: false,
      error: err.message?.slice(0, 200),
      llmLatencyMs: latencyMs,
      ipAddress,
      userAgent,
    }).catch(() => {}); // don't let audit failure break error response

    if (err.message?.includes('Rate limit')) {
      return errorResponse(err.message, 429);
    }
    if (err.message?.includes('timed out')) {
      return errorResponse('AI service timed out. Please try again.', 504);
    }
    if (err.message?.includes('spending')) {
      return errorResponse(err.message, 429);
    }

    console.error('[AI Chat] Error:', err.message);
    return errorResponse('Internal server error', 500);
  }
}
