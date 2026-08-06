// Notion — Comprehensive Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/notion-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-notion-real',
  connectorType: 'source',
  engine: 'notion-real',
  config: { host: 'https://api.notion.com/v1' },
  testTables: ['databases', 'pages', 'blocks'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
