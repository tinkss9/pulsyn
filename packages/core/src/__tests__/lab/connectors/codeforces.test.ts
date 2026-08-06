// Codeforces API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/codeforces';

const config: ConnectorTestConfig = {
  connectorId: 'test-codeforces',
  connectorType: 'source',
  engine: 'codeforces',
  config: {
    host: 'https://codeforces.com/api',
  },
  testTables: ['problems'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
