// EPA Air Quality — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/edealer';

const config: ConnectorTestConfig = {
  connectorId: 'test-edealer',
  connectorType: 'source',
  engine: 'edealer',
  config: {
    host: 'https://www.airnowapi.org/aq',
  },
  testTables: ['observation'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
