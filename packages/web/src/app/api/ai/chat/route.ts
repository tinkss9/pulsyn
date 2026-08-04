// POST /api/ai/chat — AI chat endpoint with SSE streaming
// Rate-limited per API key (org). Supports conversation history and context.
import { NextRequest } from 'next/server';
import { chat, type ChatMessage } from '@/lib/ai/llm-client';
import { answerQuestion } from '@/lib/ai/insight-generator';

// ---------------------------------------------------------------------------
// Rate limiting (same bucket as llm-client, plus API-key level)
// ---------------------------------------------------------------------------

const apiKeyLimits = new Map<string, { count: number; resetAt: number }>();
const API_KEY_RATE_LIMIT = 10;
const API_KEY_WINDOW_MS = 60_000;

function checkApiKeyRateLimit(apiKey: string): void {
  const now = Date.now();
  const entry = apiKeyLimits.get(apiKey);

  if (!entry || now > entry.resetAt) {
    apiKeyLimits.set(apiKey, { count: 1, resetAt: now + API_KEY_WINDOW_MS });
    return;
  }

  if (entry.count >= API_KEY_RATE_LIMIT) {
    throw new Error('Rate limit exceeded: 10 requests per minute');
  }

  entry.count++;
}

// ---------------------------------------------------------------------------
// SSE helper
// ---------------------------------------------------------------------------

function sseStream(reader: ReadableStreamDefaultReader<Uint8Array> | null) {
  // We'll build a manual SSE response since we don't have real streaming
  // from the LLM client yet — we simulate chunked delivery.
  return new ReadableStream({
    async start(controller) {
      controller.enqueue(new TextEncoder().encode('data: {"status":"connected"}\n\n'));
    },
  });
}

function sseResponse(data: string, eventName = 'message') {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send in small chunks to simulate streaming
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
// Handler
// ---------------------------------------------------------------------------

// Security constants
const MAX_MESSAGE_LENGTH = 4000;
const MAX_CONTEXT_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_MESSAGE_LENGTH = 2000;

/** Strip any system-role messages from user-controlled input to prevent injection */
function sanitizeHistory(
  history: { role: string; content: string }[],
): ChatMessage[] {
  return history
    .filter(
      (m) =>
        typeof m.content === 'string' &&
        (m.role === 'user' || m.role === 'assistant') && // drop system roles
        m.content.length <= MAX_HISTORY_MESSAGE_LENGTH,
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
}

export async function POST(req: NextRequest) {
  try {
    // Require authentication — reject anonymous
    const apiKey =
      req.headers.get('x-api-key') ??
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (!apiKey || apiKey === 'anonymous') {
      return errorResponse('Authentication required. Provide x-api-key or Authorization header.', 401);
    }

    checkApiKeyRateLimit(apiKey);

    const body = await req.json();
    const { message, context, conversationHistory } = body as {
      message?: string;
      context?: string;
      conversationHistory?: { role: string; content: string }[];
    };

    if (!message || typeof message !== 'string') {
      return errorResponse('Missing required field: message');
    }

    // Enforce input length limits
    if (message.length > MAX_MESSAGE_LENGTH) {
      return errorResponse(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`);
    }

    // Sanitize conversation history — drop system-role messages from user input
    const history: ChatMessage[] = Array.isArray(conversationHistory)
      ? sanitizeHistory(conversationHistory)
      : [];

    // Sanitize context — strip any system-role injection attempts, enforce length
    const sanitizedContext =
      typeof context === 'string' && context.length > 0
        ? context.slice(0, MAX_CONTEXT_LENGTH).replace(/\b(system|assistant|ignore previous|ignore all)\b/gi, '[filtered]')
        : undefined;

    if (sanitizedContext) {
      history.unshift({ role: 'user', content: `[Additional context]\n${sanitizedContext}` }); // inject as user, not system
    }

    const result = await answerQuestion(message, history, apiKey);

    // Return as SSE stream
    return sseResponse(
      JSON.stringify({
        answer: result.answer,
        sources: result.sources,
        confidence: result.confidence,
      }),
      'message',
    );
  } catch (err: any) {
    if (err.message?.includes('Rate limit')) {
      return errorResponse(err.message, 429);
    }
    console.error('[AI Chat] Error:', err.message);
    return errorResponse('Internal server error', 500);
  }
}
