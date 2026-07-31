#!/usr/bin/env node
// Pulsyn A2A Protocol Demonstration
// Shows agent-to-agent communication in action

const http = require('http');

const A2A_SERVER = 'http://localhost:3001';

// Helper to make HTTP requests
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, A2A_SERVER);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function demo() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PULSYN A2A PROTOCOL — AGENT-TO-AGENT DEMONSTRATION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Agent Discovery (A2A Spec: /.well-known/agent.json)
  // ═══════════════════════════════════════════════════════════════
  console.log('STEP 1: Agent Discovery (A2A Spec)');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('GET /.well-known/agent.json');
  console.log('');

  try {
    const discovery = await request('GET', '/.well-known/agent.json');
    console.log('Response: Found ' + discovery.agents.length + ' agents');
    console.log('');
    console.log('Available Agents:');
    discovery.agents.slice(0, 5).forEach(agent => {
      console.log('  • ' + agent.name.padEnd(25) + ' | ' + (agent.description || '').substring(0, 50));
    });
    if (discovery.agents.length > 5) {
      console.log('  ... and ' + (discovery.agents.length - 5) + ' more');
    }
    console.log('');
  } catch (err) {
    console.log('Note: A2A server not running locally. Showing offline demo.');
    console.log('');
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Find Agent by Skill
  // ═══════════════════════════════════════════════════════════════
  console.log('STEP 2: Find Agent by Skill');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('POST /a2a/discover');
  console.log('{ "skill": "replication" }');
  console.log('');

  const skillDemo = {
    'replication': { agent: 'pulsyn-cdc', confidence: 0.98 },
    'code_review': { agent: 'deepseek-r1', confidence: 0.95 },
    'research': { agent: 'deepseek-v3', confidence: 0.92 },
    'design': { agent: 'codex', confidence: 0.90 },
    'orchestration': { agent: 'kimi', confidence: 0.88 },
  };

  console.log('Skill Routing Results:');
  for (const [skill, result] of Object.entries(skillDemo)) {
    console.log('  ' + skill.padEnd(15) + ' → ' + result.agent.padEnd(20) + ' (confidence: ' + result.confidence + ')');
  }
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Send Task Between Agents (JSON-RPC 2.0)
  // ═══════════════════════════════════════════════════════════════
  console.log('STEP 3: Send Task Between Agents (JSON-RPC 2.0)');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('POST /a2a/tasks/send');
  console.log('');

  const taskRequest = {
    jsonrpc: '2.0',
    method: 'tasks/send',
    id: 'req-001',
    params: {
      agentId: 'pulsyn-cdc',
      message: 'Create a MySQL to PostgreSQL replication pipeline for the orders table',
    },
  };

  console.log('Request:');
  console.log(JSON.stringify(taskRequest, null, 2));
  console.log('');

  // Simulate response
  const taskResponse = {
    jsonrpc: '2.0',
    id: 'req-001',
    result: {
      id: 'task-abc123',
      agentId: 'pulsyn-cdc',
      status: { state: 'completed', timestamp: new Date().toISOString() },
      artifacts: [
        {
          parts: [
            {
              type: 'text',
              text: '[pulsyn-cdc] Pipeline created: pipeline-1785464829952\nStatus: running\nTables: orders\nSource: MySQL (localhost:3306/ecommerce)\nTarget: PostgreSQL (localhost:5432/analytics)',
            },
          ],
        },
      ],
    },
  };

  console.log('Response:');
  console.log(JSON.stringify(taskResponse, null, 2));
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // STEP 4: Multi-Agent Orchestration
  // ═══════════════════════════════════════════════════════════════
  console.log('STEP 4: Multi-Agent Orchestration');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('');

  const orchestration = [
    { agent: 'kimi', role: 'Orchestrator', task: 'Decompose request into subtasks' },
    { agent: 'deepseek-v3', role: 'Researcher', task: 'Analyze source schema' },
    { agent: 'pulsyn-cdc', role: 'Executor', task: 'Create and start pipeline' },
    { agent: 'deepseek-r1', role: 'Reviewer', task: 'Validate data quality' },
  ];

  console.log('Multi-Agent Pipeline:');
  orchestration.forEach((step, i) => {
    const arrow = i < orchestration.length - 1 ? '  ↓' : '  ✓';
    console.log('  ' + (i + 1) + '. ' + step.agent.padEnd(15) + ' [' + step.role.padEnd(12) + '] ' + step.task);
    if (i < orchestration.length - 1) console.log(arrow);
  });
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // STEP 5: Agent Card Format (A2A Spec)
  // ═══════════════════════════════════════════════════════════════
  console.log('STEP 5: Agent Card Format (A2A Spec)');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('');

  const agentCard = {
    name: 'Pulsyn CDC Agent',
    description: 'AI-native Change Data Capture platform',
    url: 'https://pulsyn.vercel.app/a2a',
    version: '1.0.0',
    capabilities: {
      streaming: true,
      pushNotifications: false,
      stateTransitionHistory: true,
    },
    skills: [
      {
        id: 'replication',
        name: 'Data Replication',
        description: 'Set up CDC pipelines between databases',
        tags: ['cdc', 'replication', 'data-sync', 'etl'],
      },
      {
        id: 'schema-discovery',
        name: 'Schema Discovery',
        description: 'Discover and analyze database schemas',
        tags: ['schema', 'discovery', 'tables', 'columns'],
      },
      {
        id: 'data-validation',
        name: 'Data Validation',
        description: 'Validate data quality and integrity',
        tags: ['validation', 'quality', 'integrity'],
      },
    ],
    provider: {
      organization: 'Pulsyn',
      url: 'https://pulsyn.io',
    },
    authentication: {
      schemes: ['bearer'],
    },
  };

  console.log('Agent Card (GET /a2a/agents/pulsyn-cdc):');
  console.log(JSON.stringify(agentCard, null, 2));
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // STEP 6: Task Lifecycle (A2A Spec)
  // ═══════════════════════════════════════════════════════════════
  console.log('STEP 6: Task Lifecycle (A2A Spec)');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('');

  const taskLifecycle = [
    { state: 'submitted', description: 'Task received by agent' },
    { state: 'working', description: 'Agent processing task' },
    { state: 'input-required', description: 'Agent needs more info' },
    { state: 'completed', description: 'Task finished successfully' },
    { state: 'canceled', description: 'Task was canceled' },
    { state: 'failed', description: 'Task failed' },
  ];

  console.log('Task States:');
  taskLifecycle.forEach(t => {
    const icon = t.state === 'completed' ? '✓' : t.state === 'failed' ? '✗' : '○';
    console.log('  ' + icon + ' ' + t.state.padEnd(18) + ' ' + t.description);
  });
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  A2A PROTOCOL — COMPETITIVE ADVANTAGE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Pulsyn is the ONLY CDC platform with A2A protocol support:');
  console.log('');
  console.log('  ✅ Agent Discovery — /.well-known/agent.json');
  console.log('  ✅ Skill Routing — Find agent by capability');
  console.log('  ✅ JSON-RPC 2.0 — Standard task protocol');
  console.log('  ✅ Task Lifecycle — submitted → working → completed');
  console.log('  ✅ Multi-Agent — Orchestrate across agents');
  console.log('  ✅ Agent Cards — Self-describing agents');
  console.log('');
  console.log('Fivetran: ❌ No A2A, no agent integration');
  console.log('Airbyte:  ❌ No A2A, no agent integration');
  console.log('Qlik:     ❌ No A2A, no agent integration');
  console.log('');
  console.log('Pulsyn:   ✅ MCP + A2A + CLI + API — AI-native CDC');
  console.log('');
}

demo().catch(console.error);
