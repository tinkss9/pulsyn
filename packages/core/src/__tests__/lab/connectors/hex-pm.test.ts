// Hex.pm (Elixir) — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hex-pm';

const config: ConnectorTestConfig = {
  connectorId: 'test-hex-pm',
  connectorType: 'source',
  engine: 'hex-pm',
  config: { host: 'hex.pm/api' },
  testTables: ['packages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
