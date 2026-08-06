// Dragon Ball API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dragonball';

const config: ConnectorTestConfig = {
  connectorId: 'test-dragonball',
  connectorType: 'source',
  engine: 'dragonball',
  config: {
    host: 'https://dragonball-api.com/api',
  },
  testTables: ['characters'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
