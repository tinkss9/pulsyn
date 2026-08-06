// Lever API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/lever-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-lever-api',
  connectorType: 'source',
  engine: 'lever-api',
  config: { host: 'https://api.lever.co/v1' },
  testTables: ['postings'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
