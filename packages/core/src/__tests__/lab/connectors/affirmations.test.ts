// Affirmations — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/affirmations';

const config: ConnectorTestConfig = {
  connectorId: 'test-affirmations',
  connectorType: 'source',
  engine: 'affirmations',
  config: {
    host: 'https://www.affirmations.dev',
  },
  testTables: ['affirmations'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
