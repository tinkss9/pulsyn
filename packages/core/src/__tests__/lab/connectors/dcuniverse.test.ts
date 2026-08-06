// DC Universe API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dcuniverse';

const config: ConnectorTestConfig = {
  connectorId: 'test-dcuniverse',
  connectorType: 'source',
  engine: 'dcuniverse',
  config: {
    host: 'https://dcuniverseapi.com/api',
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
