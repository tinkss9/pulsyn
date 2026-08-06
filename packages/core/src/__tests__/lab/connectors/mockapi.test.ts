// MockAPI — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mockapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-mockapi',
  connectorType: 'source',
  engine: 'mockapi',
  config: {
    host: 'https://64a7f3a2dca581467b5548ab.mockapi.io',
  },
  testTables: ['users'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
