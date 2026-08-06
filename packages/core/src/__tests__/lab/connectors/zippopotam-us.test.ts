// Zippopotam US — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zippopotam-us';

const config: ConnectorTestConfig = {
  connectorId: 'test-zippopotam-us',
  connectorType: 'source',
  engine: 'zippopotam-us',
  config: { host: 'https://api.zippopotam.us' },
  testTables: ['us'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
