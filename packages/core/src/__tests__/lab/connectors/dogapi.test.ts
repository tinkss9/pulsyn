// Dog API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dogapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-dogapi',
  connectorType: 'source',
  engine: 'dogapi',
  config: {
    host: 'https://dogapi.dog/api/v2',
  },
  testTables: ['breeds'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
