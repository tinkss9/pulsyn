// Lever API v1 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/lever-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-lever-real',
  connectorType: 'source',
  engine: 'lever-real',
  config: { host: 'https://api.lever.co/v1' },
  testTables: ['postings', 'candidates', 'applications'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
