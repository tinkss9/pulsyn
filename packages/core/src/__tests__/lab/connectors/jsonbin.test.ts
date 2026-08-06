// JSONBin — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/jsonbin';

const config: ConnectorTestConfig = {
  connectorId: 'test-jsonbin',
  connectorType: 'source',
  engine: 'jsonbin',
  config: {
    host: 'https://api.jsonbin.io/v3',
  },
  testTables: ['bins'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
