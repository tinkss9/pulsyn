// Hashify — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hashify';

const config: ConnectorTestConfig = {
  connectorId: 'test-hashify',
  connectorType: 'source',
  engine: 'hashify',
  config: { host: 'https://hashify.net' },
  testTables: ['hash'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
