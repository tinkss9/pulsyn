// Free Dictionary — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dictionary';

const config: ConnectorTestConfig = {
  connectorId: 'test-dictionary',
  connectorType: 'source',
  engine: 'dictionary',
  config: {
    host: 'https://api.dictionaryapi.dev/api/v2',
  },
  testTables: ['entries'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
