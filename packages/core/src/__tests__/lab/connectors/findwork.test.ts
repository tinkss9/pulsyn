// FindWork — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/findwork';

const config: ConnectorTestConfig = {
  connectorId: 'test-findwork',
  connectorType: 'source',
  engine: 'findwork',
  config: {
    host: 'https://findwork.dev/api/jobs',
  },
  testTables: ['jobs'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
