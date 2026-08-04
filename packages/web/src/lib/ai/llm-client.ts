// Unified LLM Client — DeepSeek + Claude with auto-routing, rate limiting, and caching
import { query } from '@/lib/db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Force a specific provider instead of auto-selecting. */
  provider?: LLMProvider;
}

export interface ChatResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  usage: { promptTokens: number; completionTokens: number };
  cached: boolean;
}

export type LLMProvider = 'deepseek' | 'anthropic';

// ---------------------------------------------------------------------------
// In-memory rate limiter (10 requests / minute / org)
// ---------------------------------------------------------------------------

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(orgId: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(orgId);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(orgId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return;
  }

  if (entry.count >= RATE_LIMIT) {
    throw new Error(`Rate limit exceeded: ${RATE_LIMIT} requests per minute for org ${orgId}`);
  }

  entry.count++;
}

// ---------------------------------------------------------------------------
// Response cache (1-hour TTL, keyed by message hash)
// ---------------------------------------------------------------------------

interface CacheEntry {
  response: ChatResponse;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 3_600_000; // 1 hour

function hashMessages(messages: ChatMessage[]): string {
  const raw = JSON.stringify(messages);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return `llm-${hash.toString(36)}`;
}

function getCached(key: string): ChatResponse | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return { ...entry.response, cached: true };
}

function setCache(key: string, response: ChatResponse): void {
  responseCache.set(key, { response, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ---------------------------------------------------------------------------
// Provider callers
// ---------------------------------------------------------------------------

async function callDeepSeek(
  messages: ChatMessage[],
  maxTokens: number,
  temperature: number,
): Promise<ChatResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not configured');

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice) throw new Error('DeepSeek returned no choices');

  return {
    content: choice.message?.content ?? '',
    provider: 'deepseek',
    model: data.model ?? 'deepseek-chat',
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
    },
    cached: false,
  };
}

async function callAnthropic(
  messages: ChatMessage[],
  maxTokens: number,
  temperature: number,
): Promise<ChatResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');

  // Anthropic Messages API: system message is a top-level param
  const systemMsg = messages.find(m => m.role === 'system');
  const nonSystem = messages.filter(m => m.role !== 'system');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      temperature,
      system: systemMsg?.content,
      messages: nonSystem.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const textBlock = data.content?.find((b: any) => b.type === 'text');

  return {
    content: textBlock?.text ?? '',
    provider: 'anthropic',
    model: data.model ?? 'claude-sonnet-4-20250514',
    usage: {
      promptTokens: data.usage?.input_tokens ?? 0,
      completionTokens: data.usage?.output_tokens ?? 0,
    },
    cached: false,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Auto-select cheapest provider (DeepSeek first, Claude fallback).
 * Caches identical prompts for 1 hour. Rate-limits to 10/min/org.
 */
export async function chat(
  options: ChatOptions,
  orgId: string = 'default',
): Promise<ChatResponse> {
  checkRateLimit(orgId);

  const {
    messages,
    maxTokens = 1024,
    temperature = 0.3,
    provider,
  } = options;

  // Check cache
  const cacheKey = hashMessages(messages);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Build provider order: cheapest first
  const providers: LLMProvider[] = provider
    ? [provider]
    : ['deepseek', 'anthropic'];

  let lastError: Error | null = null;

  for (const p of providers) {
    try {
      const fn = p === 'deepseek' ? callDeepSeek : callAnthropic;
      const response = await fn(messages, maxTokens, temperature);
      setCache(cacheKey, response);
      return response;
    } catch (err: any) {
      lastError = err;
      // If forced provider, don't fallback
      if (provider) throw err;
      console.warn(`[LLM] ${p} failed, trying next:`, err.message);
    }
  }

  throw lastError ?? new Error('All LLM providers failed');
}

/**
 * Analyze structured data with an LLM and return a text explanation.
 */
export async function analyze(
  data: Record<string, any>,
  instruction: string,
  orgId: string = 'default',
): Promise<ChatResponse> {
  return chat(
    {
      messages: [
        {
          role: 'system',
          content:
            'You are Pulsyn AI, an expert CDC and data-pipeline analyst. ' +
            'Respond with clear, actionable insights. Be concise.',
        },
        {
          role: 'user',
          content: `${instruction}\n\nData:\n${JSON.stringify(data, null, 2)}`,
        },
      ],
      maxTokens: 1024,
      temperature: 0.2,
    },
    orgId,
  );
}

/**
 * Explain a concept, metric, or error in plain language.
 */
export async function explain(
  topic: string,
  context?: string,
  orgId: string = 'default',
): Promise<ChatResponse> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'You are Pulsyn AI. Explain CDC and data-pipeline concepts clearly. ' +
        'Keep answers under 200 words unless more detail is requested.',
    },
    {
      role: 'user',
      content: context
        ? `Explain: ${topic}\n\nContext:\n${context}`
        : `Explain: ${topic}`,
    },
  ];

  return chat({ messages, maxTokens: 512, temperature: 0.3 }, orgId);
}

/**
 * Expose provider list for health-checks.
 */
export function availableProviders(): LLMProvider[] {
  const providers: LLMProvider[] = [];
  if (process.env.DEEPSEEK_API_KEY) providers.push('deepseek');
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');
  return providers;
}
