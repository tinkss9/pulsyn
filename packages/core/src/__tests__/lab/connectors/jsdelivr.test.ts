// jsDelivr Stats — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/jsdelivr';

const config: ConnectorTestConfig = {
  connectorId: 'test-jsdelivr',
  connectorType: 'source',
  engine: 'jsdelivr',
  config: {
    host: 'https://data.jsdelivr.com/v1',
  },
  testTables: ['packages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
