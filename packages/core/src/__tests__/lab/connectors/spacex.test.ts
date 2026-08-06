// SpaceX API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/spacex';

const config: ConnectorTestConfig = {
  connectorId: 'test-spacex',
  connectorType: 'source',
  engine: 'spacex',
  config: {
    host: 'https://api.spacexdata.com/v4',
  },
  testTables: ['rockets', 'launches', 'capsules'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
