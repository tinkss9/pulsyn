// Insight Generator — bridges Pulsyn data with the LLM client
// Provides natural-language insights, anomaly explanations, optimization
// recommendations, and RAG-powered Q&A.
import { query } from '@/lib/db';
import { chat, analyze, explain, type ChatMessage, type ChatResponse } from './llm-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NaturalLanguageInsight {
  id: string;
  category: string;
  title: string;
  summary: string;
  details: string;
  confidence: number;
  generatedAt: string;
}

export interface AnomalyExplanation {
  anomalyType: string;
  severity: string;
  explanation: string;
  rootCause: string;
  recommendedActions: string[];
}

export interface Optimization {
  area: string;
  currentState: string;
  recommendedState: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface QAResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function fetchRecentContext(limit = 20): Promise<string> {
  try {
    const connectors = await query(
      `SELECT engine, status, COUNT(*) as count FROM connectors GROUP BY engine, status ORDER BY count DESC LIMIT $1`,
      [limit],
    );
    const pipelines = await query(
      `SELECT status, COUNT(*) as count FROM pipelines GROUP BY status ORDER BY count DESC LIMIT $1`,
      [limit],
    );
    const cdc = await query(
      `SELECT table_name, operation, COUNT(*) as count FROM _pulsyn_changes GROUP BY table_name, operation ORDER BY count DESC LIMIT $1`,
      [limit],
    );

    return [
      '## Connectors',
      ...connectors.rows.map(
        (r: any) => `- ${r.engine} (${r.status}): ${r.count}`,
      ),
      '',
      '## Pipelines',
      ...pipelines.rows.map(
        (r: any) => `- ${r.status}: ${r.count}`,
      ),
      '',
      '## Recent CDC Activity',
      ...cdc.rows.map(
        (r: any) => `- ${r.table_name} ${r.operation}: ${r.count} events`,
      ),
    ].join('\n');
  } catch {
    return '(No live data available — using rule-based fallback)';
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate natural-language insights from current pipeline/connector/CDC data.
 * Falls back to rule-based summaries if the LLM is unavailable.
 */
export async function generateNaturalLanguageInsights(
  orgId: string = 'default',
): Promise<NaturalLanguageInsight[]> {
  const context = await fetchRecentContext();

  try {
    const response = await analyze(
      { context },
      'Based on the following Pulsyn platform data, generate 3-5 actionable insights. ' +
        'For each insight return a JSON array of objects with: category, title, summary, details, confidence (0-1). ' +
        'Return ONLY valid JSON, no markdown fences.',
      orgId,
    );

    const parsed = JSON.parse(response.content);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        id: generateId('insight'),
        category: item.category ?? 'general',
        title: item.title ?? 'Insight',
        summary: item.summary ?? '',
        details: item.details ?? '',
        confidence: typeof item.confidence === 'number' ? item.confidence : 0.7,
        generatedAt: new Date().toISOString(),
      }));
    }
  } catch {
    // LLM unavailable — fall through to rule-based
  }

  // Rule-based fallback
  return [
    {
      id: generateId('rb'),
      category: 'status',
      title: 'Platform Overview',
      summary: 'Pulsyn is operational. Monitor connectors and pipelines for anomalies.',
      details: context,
      confidence: 0.9,
      generatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Explain a detected anomaly in plain language with root-cause analysis.
 */
export async function explainAnomaly(
  anomaly: {
    type: string;
    severity: string;
    description: string;
    affectedResource: string;
  },
  orgId: string = 'default',
): Promise<AnomalyExplanation> {
  try {
    const response = await analyze(
      anomaly,
      'Explain this Pulsyn CDC anomaly. Return a JSON object with: ' +
        'anomalyType, severity, explanation (2-3 sentences), rootCause, recommendedActions (string array). ' +
        'Return ONLY valid JSON, no markdown fences.',
      orgId,
    );

    const parsed = JSON.parse(response.content);
    return {
      anomalyType: parsed.anomalyType ?? anomaly.type,
      severity: parsed.severity ?? anomaly.severity,
      explanation: parsed.explanation ?? anomaly.description,
      rootCause: parsed.rootCause ?? 'Unknown',
      recommendedActions: Array.isArray(parsed.recommendedActions)
        ? parsed.recommendedActions
        : ['Investigate the affected resource'],
    };
  } catch {
    // Rule-based fallback
    return {
      anomalyType: anomaly.type,
      severity: anomaly.severity,
      explanation: anomaly.description,
      rootCause: 'Requires manual investigation',
      recommendedActions: [
        `Review ${anomaly.affectedResource} for configuration issues`,
        'Check recent changes to the affected resource',
        'Contact support if the issue persists',
      ],
    };
  }
}

/**
 * Recommend optimizations for connectors, pipelines, or CDC configuration.
 */
export async function recommendOptimizations(
  orgId: string = 'default',
): Promise<Optimization[]> {
  const context = await fetchRecentContext();

  try {
    const response = await analyze(
      { context },
      'Based on this Pulsyn platform data, recommend 3-5 optimizations. ' +
        'Return a JSON array of objects with: area, currentState, recommendedState, impact, effort ("low"|"medium"|"high"). ' +
        'Return ONLY valid JSON, no markdown fences.',
      orgId,
    );

    const parsed = JSON.parse(response.content);
    if (Array.isArray(parsed)) {
      return parsed.map((o: any) => ({
        area: o.area ?? 'general',
        currentState: o.currentState ?? 'Unknown',
        recommendedState: o.recommendedState ?? 'Unknown',
        impact: o.impact ?? 'Medium',
        effort: ['low', 'medium', 'high'].includes(o.effort) ? o.effort : 'medium',
      }));
    }
  } catch {
    // Fall through to rule-based
  }

  // Rule-based fallback
  return [
    {
      area: 'Monitoring',
      currentState: 'Standard monitoring',
      recommendedState: 'Enable anomaly detection alerts for CDC throughput drops',
      impact: 'Faster incident response',
      effort: 'low',
    },
  ];
}

/**
 * Answer a free-form question about the user's Pulsyn data using RAG.
 * Fetches relevant context from the DB, then asks the LLM.
 */
export async function answerQuestion(
  question: string,
  conversationHistory: ChatMessage[] = [],
  orgId: string = 'default',
): Promise<QAResponse> {
  // RAG: fetch relevant context based on keywords in the question
  const keywords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3);

  let ragContext = '';

  if (keywords.length > 0) {
    try {
      // Search connectors, pipelines, and CDC tables for relevant rows
      const searchPattern = keywords.slice(0, 5).join('|');

      const connResults = await query(
        `SELECT engine, status, name FROM connectors WHERE engine ILIKE ANY(string_to_array($1, '|')) LIMIT 5`,
        [searchPattern],
      );
      const pipeResults = await query(
        `SELECT id, status, source_engine, target_engine FROM pipelines WHERE status ILIKE ANY(string_to_array($1, '|')) LIMIT 5`,
        [searchPattern],
      );
      const cdcResults = await query(
        `SELECT table_name, operation, COUNT(*) as cnt FROM _pulsyn_changes WHERE table_name ILIKE ANY(string_to_array($1, '|')) GROUP BY table_name, operation LIMIT 5`,
        [searchPattern],
      );

      const parts: string[] = [];
      if (connResults.rows.length)
        parts.push('Matching connectors:\n' + connResults.rows.map((r: any) => `- ${r.engine} (${r.status})`).join('\n'));
      if (pipeResults.rows.length)
        parts.push('Matching pipelines:\n' + pipeResults.rows.map((r: any) => `- ${r.id} (${r.status})`).join('\n'));
      if (cdcResults.rows.length)
        parts.push('Matching CDC activity:\n' + cdcResults.rows.map((r: any) => `- ${r.table_name} ${r.operation}: ${r.cnt}`).join('\n'));

      ragContext = parts.join('\n\n');
    } catch {
      // RAG search failed — continue without it
    }
  }

  const systemPrompt =
    'You are Pulsyn AI, an expert assistant for the Pulsyn CDC platform. ' +
    'Answer questions about connectors, pipelines, CDC events, and data replication. ' +
    'Be concise and actionable. If you do not have enough data, say so.';

  const contextBlock = ragContext ? `\n\nRelevant data:\n${ragContext}` : '';

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: `${question}${contextBlock}` },
  ];

  try {
    const response = await chat({ messages, maxTokens: 1024, temperature: 0.3 }, orgId);
    return {
      answer: response.content,
      sources: ragContext ? ['database'] : [],
      confidence: ragContext ? 0.85 : 0.6,
    };
  } catch {
    return {
      answer: 'I was unable to process your question at this time. Please check that the LLM service is configured and try again.',
      sources: [],
      confidence: 0,
    };
  }
}
