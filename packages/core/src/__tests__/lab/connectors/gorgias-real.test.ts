// Gorgias API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gorgias-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-gorgias-real',
  connectorType: 'source',
  engine: 'gorgias-real',
  config: { host: 'https://{domain}.gorgias.com/api' },
  testTables: ['tickets', 'customers', 'messages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
