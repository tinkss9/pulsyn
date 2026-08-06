// Zippopotam.us — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zippopotam';

const config: ConnectorTestConfig = {
  connectorId: 'test-zippopotam',
  connectorType: 'source',
  engine: 'zippopotam',
  config: {
    host: 'https://api.zippopotam.us',
  },
  testTables: ['us'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
