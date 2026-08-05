import { NextRequest, NextResponse } from 'next/server';

// AI Agent for Pulsyn Lab users
// Provides real-time guidance, tips, and assistance during lab sessions

interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Knowledge base for the AI agent
const KNOWLEDGE_BASE = {
  tips: {
    rows: [
      'Increase batch size to 10,000 for higher throughput',
      'Use COPY protocol for bulk loads instead of INSERT',
      'Disable indexes during initial load, rebuild after',
      'Use connection pooling (pgBouncer) for concurrent streams',
      'Partition large tables for parallel replication',
    ],
    tools: [
      'Try the MCP tools — they\'re faster than CLI for repetitive tasks',
      'Use `pulsyn benchmark run` to test your setup before competing',
      'The masking engine has 4 modes: hash, replace, format-preserving, redact',
      'Checkpoint recovery works best with 10-second intervals',
      'Use `pulsyn pipeline metrics` to monitor real-time performance',
    ],
    multi: [
      'Start with PostgreSQL → MySQL (most stable pair)',
      'Test checkpoint recovery for each engine pair separately',
      'Use schema discovery before creating pipelines',
      'Oracle requires special driver configuration',
      'MongoDB uses different CDC mechanism (oplog vs WAL)',
    ],
  },
  troubleshooting: {
    'low throughput': 'Check network latency between source and target. Use batch inserts. Increase shared_buffers.',
    'connection failed': 'Verify credentials, check firewall rules, ensure database is accepting connections.',
    'checkpoint error': 'Ensure target database has sufficient storage. Check replication slot status.',
    'data mismatch': 'Run data integrity check. Compare row counts. Check for encoding issues.',
    'high latency': 'Use connection pooling. Reduce batch size. Check network bandwidth.',
  },
  commands: {
    'create pipeline': 'pulsyn pipeline create --name <name> --source-host <host> --target-host <host> --tables <tables>',
    'start replication': 'pulsyn pipeline start <pipeline-id>',
    'check metrics': 'pulsyn pipeline metrics <pipeline-id>',
    'test connection': 'pulsyn connector test <connector-id>',
    'list tables': 'pulsyn connector tables <connector-id>',
    'run benchmark': 'pulsyn benchmark run --source-engine postgresql --target-engine postgresql',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Simple keyword-based response (replace with actual LLM in production)
    const response = generateResponse(message, context);

    return NextResponse.json({
      success: true,
      data: {
        response: response.content,
        suggestions: response.suggestions,
        relatedCommands: response.commands,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateResponse(message: string, context?: string): {
  content: string;
  suggestions: string[];
  commands: string[];
} {
  const lower = message.toLowerCase();

  // Check for tips
  if (lower.includes('tip') || lower.includes('help') || lower.includes('how to')) {
    if (lower.includes('rows') || lower.includes('speed') || lower.includes('throughput')) {
      return {
        content: `Here are some tips for maximizing rows replicated:\n\n${KNOWLEDGE_BASE.tips.rows.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
        suggestions: ['Show me batch size optimization', 'How do I use COPY protocol?', 'What\'s the best checkpoint interval?'],
        commands: ['pulsyn pipeline create', 'pulsyn pipeline metrics'],
      };
    }
    if (lower.includes('tool') || lower.includes('feature') || lower.includes('mcp')) {
      return {
        content: `Here are tips for using Pulsyn tools effectively:\n\n${KNOWLEDGE_BASE.tips.tools.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
        suggestions: ['Show me MCP tools', 'How do I run a benchmark?', 'What masking options are there?'],
        commands: ['pulsyn benchmark run', 'pulsyn connector test'],
      };
    }
    if (lower.includes('multi') || lower.includes('engine') || lower.includes('pair')) {
      return {
        content: `Tips for multi-engine replication:\n\n${KNOWLEDGE_BASE.tips.multi.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
        suggestions: ['Which engine pair is easiest?', 'How do I test checkpoint recovery?', 'What about Oracle?'],
        commands: ['pulsyn connector create', 'pulsyn pipeline create'],
      };
    }
  }

  // Check for troubleshooting
  for (const [issue, solution] of Object.entries(KNOWLEDGE_BASE.troubleshooting)) {
    if (lower.includes(issue)) {
      return {
        content: `**Troubleshooting: ${issue}**\n\n${solution}`,
        suggestions: ['Show me more details', 'What else could cause this?', 'How do I verify the fix?'],
        commands: ['pulsyn health', 'pulsyn connector test'],
      };
    }
  }

  // Check for commands
  for (const [cmd, syntax] of Object.entries(KNOWLEDGE_BASE.commands)) {
    if (lower.includes(cmd)) {
      return {
        content: `**Command: ${cmd}**\n\n\`\`\`\n${syntax}\n\`\`\``,
        suggestions: ['Show me an example', 'What are the options?', 'How do I verify it worked?'],
        commands: [syntax],
      };
    }
  }

  // Default response
  return {
    content: `I'm your Pulsyn Lab AI assistant. I can help with:\n\n• **Tips** — Ask for tips on rows, tools, or multi-engine replication\n• **Troubleshooting** — Describe an issue and I'll help fix it\n• **Commands** — Ask about specific Pulsyn commands\n• **Strategy** — Get advice for competition strategy\n\nTry asking: "How do I maximize throughput?" or "What tools should I use?"`,
    suggestions: ['Show me tips for speed', 'How do I create a pipeline?', 'What\'s the scoring formula?'],
    commands: [],
  };
}

export async function GET() {
  return NextResponse.json({
    name: 'Pulsyn Lab AI Assistant',
    description: 'Real-time guidance and tips for lab sessions',
    capabilities: [
      'Performance optimization tips',
      'Troubleshooting assistance',
      'Command reference',
      'Competition strategy',
      'Tool recommendations',
    ],
    knowledgeBase: {
      tips: Object.keys(KNOWLEDGE_BASE.tips).length,
      troubleshooting: Object.keys(KNOWLEDGE_BASE.troubleshooting).length,
      commands: Object.keys(KNOWLEDGE_BASE.commands).length,
    },
  });
}
