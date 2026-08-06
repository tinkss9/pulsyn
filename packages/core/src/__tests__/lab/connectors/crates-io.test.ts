// Crates.io — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/crates-io';

const config: ConnectorTestConfig = {
  connectorId: 'test-crates-io',
  connectorType: 'source',
  engine: 'crates-io',
  config: {
    host: 'https://crates.io/api/v1',
  },
  testTables: ['crates'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
