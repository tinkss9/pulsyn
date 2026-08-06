// SpaceX v4 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/spacex-v4';

const config: ConnectorTestConfig = {
  connectorId: 'test-spacex-v4',
  connectorType: 'source',
  engine: 'spacex-v4',
  config: { host: 'https://api.spacexdata.com/v4' },
  testTables: ['rockets', 'launches'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
