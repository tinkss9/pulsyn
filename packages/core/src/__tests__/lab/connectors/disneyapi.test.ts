// Disney API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/disneyapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-disneyapi',
  connectorType: 'source',
  engine: 'disneyapi',
  config: {
    host: 'https://api.disneyapi.dev',
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
