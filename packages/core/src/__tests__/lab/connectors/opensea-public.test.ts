// OpenSea Public — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/opensea-public';

const config: ConnectorTestConfig = {
  connectorId: 'test-opensea-public',
  connectorType: 'source',
  engine: 'opensea-public',
  config: {
    host: 'https://api.opensea.io/api/v2',
  },
  testTables: ['collections'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
