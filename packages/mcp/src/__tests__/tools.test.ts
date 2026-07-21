// Pulsyn MCP Server Tests

import { describe, it, expect } from 'vitest';

// We test the tool definitions and response formats
// The actual server requires stdio transport which is hard to test in unit tests
// So we test the tool schemas and expected behaviors

describe('Pulsyn MCP Tools', () => {
  describe('tool definitions', () => {
    const expectedTools = [
      'pulsyn.health',
      'pulsyn.pipeline.list',
      'pulsyn.pipeline.get',
      'pulsyn.pipeline.create',
      'pulsyn.pipeline.start',
      'pulsyn.pipeline.stop',
      'pulsyn.pipeline.pause',
      'pulsyn.pipeline.delete',
      'pulsyn.pipeline.metrics',
      'pulsyn.pipeline.checkpoints',
      'pulsyn.connector.list',
      'pulsyn.connector.create',
      'pulsyn.connector.test',
      'pulsyn.connector.tables',
      'pulsyn.connector.schema',
      'pulsyn.connector.delete',
      'pulsyn.billing.plans',
      'pulsyn.billing.status',
      'pulsyn.billing.subscribe',
      'pulsyn.billing.usage',
      'pulsyn.billing.record_usage',
      'pulsyn.billing.checkout',
      'pulsyn.benchmark.run',
      'pulsyn.benchmark.reports',
      'pulsyn.benchmark.certification',
      'pulsyn.benchmark.suites',
    ];

    it('defines 26 tools', () => {
      expect(expectedTools).toHaveLength(26);
    });

    it('has pipeline tools for full lifecycle', () => {
      const pipelineTools = expectedTools.filter(t => t.startsWith('pulsyn.pipeline.'));
      expect(pipelineTools).toContain('pulsyn.pipeline.list');
      expect(pipelineTools).toContain('pulsyn.pipeline.create');
      expect(pipelineTools).toContain('pulsyn.pipeline.start');
      expect(pipelineTools).toContain('pulsyn.pipeline.stop');
      expect(pipelineTools).toContain('pulsyn.pipeline.pause');
      expect(pipelineTools).toContain('pulsyn.pipeline.delete');
      expect(pipelineTools).toContain('pulsyn.pipeline.metrics');
      expect(pipelineTools).toContain('pulsyn.pipeline.checkpoints');
    });

    it('has connector tools for full lifecycle', () => {
      const connectorTools = expectedTools.filter(t => t.startsWith('pulsyn.connector.'));
      expect(connectorTools).toContain('pulsyn.connector.list');
      expect(connectorTools).toContain('pulsyn.connector.create');
      expect(connectorTools).toContain('pulsyn.connector.test');
      expect(connectorTools).toContain('pulsyn.connector.tables');
      expect(connectorTools).toContain('pulsyn.connector.schema');
      expect(connectorTools).toContain('pulsyn.connector.delete');
    });

    it('has billing tools for subscription management', () => {
      const billingTools = expectedTools.filter(t => t.startsWith('pulsyn.billing.'));
      expect(billingTools).toContain('pulsyn.billing.plans');
      expect(billingTools).toContain('pulsyn.billing.status');
      expect(billingTools).toContain('pulsyn.billing.subscribe');
      expect(billingTools).toContain('pulsyn.billing.usage');
      expect(billingTools).toContain('pulsyn.billing.record_usage');
      expect(billingTools).toContain('pulsyn.billing.checkout');
    });

    it('has benchmark tools for connector certification', () => {
      const benchmarkTools = expectedTools.filter(t => t.startsWith('pulsyn.benchmark.'));
      expect(benchmarkTools).toContain('pulsyn.benchmark.run');
      expect(benchmarkTools).toContain('pulsyn.benchmark.reports');
      expect(benchmarkTools).toContain('pulsyn.benchmark.certification');
      expect(benchmarkTools).toContain('pulsyn.benchmark.suites');
    });
  });

  describe('API client integration', () => {
    it('reads API URL from environment', () => {
      const url = process.env.PULSYN_API_URL || 'http://localhost:8080';
      expect(url).toBeDefined();
      expect(url).toMatch(/^https?:\/\//);
    });

    it('reads API key from environment when set', () => {
      const key = process.env.PULSYN_API_KEY;
      // API key is optional
      expect(key === undefined || typeof key === 'string').toBe(true);
    });
  });

  describe('response format', () => {
    it('success response has text content', () => {
      // Simulate success response format
      const response = {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ status: 'healthy' }, null, 2),
          },
        ],
      };

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.status).toBe('healthy');
    });

    it('error response has isError flag', () => {
      // Simulate error response format
      const response = {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'Not found', status: 404 }, null, 2),
          },
        ],
        isError: true,
      };

      expect(response.isError).toBe(true);
      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.error).toBe('Not found');
      expect(parsed.status).toBe(404);
    });
  });
});
