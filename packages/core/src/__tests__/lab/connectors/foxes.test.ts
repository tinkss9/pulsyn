// Random Fox — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/foxes';

const config: ConnectorTestConfig = {
  connectorId: 'test-foxes',
  connectorType: 'source',
  engine: 'foxes',
  config: { host: 'https://randomfox.ca' },
  testTables: ['foxes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
