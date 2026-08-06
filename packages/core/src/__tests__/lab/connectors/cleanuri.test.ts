// CleanURI — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cleanuri';

const config: ConnectorTestConfig = {
  connectorId: 'test-cleanuri',
  connectorType: 'source',
  engine: 'cleanuri',
  config: {
    host: 'https://cleanuri.com/api/v1',
  },
  testTables: ['shorten'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
