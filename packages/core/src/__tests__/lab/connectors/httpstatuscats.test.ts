// HTTP Status Cats — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/httpstatuscats';

const config: ConnectorTestConfig = {
  connectorId: 'test-httpstatuscats',
  connectorType: 'source',
  engine: 'httpstatuscats',
  config: {
    host: 'https://http.cat',
  },
  testTables: ['statuses'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
