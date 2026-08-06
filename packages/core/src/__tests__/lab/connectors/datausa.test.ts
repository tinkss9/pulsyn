// Data USA — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/datausa';

const config: ConnectorTestConfig = {
  connectorId: 'test-datausa',
  connectorType: 'source',
  engine: 'datausa',
  config: {
    host: 'https://datausa.io/api',
  },
  testTables: ['population'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
