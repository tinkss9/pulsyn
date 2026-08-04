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

export async function POST(req: NextRequest) {
  try {
    // Extract API key from header or query
    const apiKey =
      req.headers.get('x-api-key') ??
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
      'anonymous';

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

    // Use the RAG-powered Q&A for rich answers
    const history: ChatMessage[] = Array.isArray(conversationHistory)
      ? conversationHistory
          .filter(
            (m): m is { role: 'system' | 'user' | 'assistant'; content: string } =>
              typeof m.content === 'string' &&
              (m.role === 'system' || m.role === 'user' || m.role === 'assistant'),
          )
          .slice(-10) // keep last 10 messages
      : [];

    // If there's extra context, prepend it as a system message
    if (context) {
      history.unshift({ role: 'system', content: `Additional context:\n${context}` });
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
