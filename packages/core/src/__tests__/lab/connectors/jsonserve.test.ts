// JSONServe — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/jsonserve';

const config: ConnectorTestConfig = {
  connectorId: 'test-jsonserve',
  connectorType: 'source',
  engine: 'jsonserve',
  config: {
    host: 'https://jsonserve.com',
  },
  testTables: ['data'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
