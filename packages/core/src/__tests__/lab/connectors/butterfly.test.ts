// Butterfly API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/butterfly';

const config: ConnectorTestConfig = {
  connectorId: 'test-butterfly',
  connectorType: 'source',
  engine: 'butterfly',
  config: {
    host: 'https://butterfly.watch/api',
  },
  testTables: ['species'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
