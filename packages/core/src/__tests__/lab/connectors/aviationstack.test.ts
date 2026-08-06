// Aviationstack — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/aviationstack';

const config: ConnectorTestConfig = {
  connectorId: 'test-aviationstack',
  connectorType: 'source',
  engine: 'aviationstack',
  config: {
    host: 'http://api.aviationstack.com/v1',
  },
  testTables: ['flights'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
