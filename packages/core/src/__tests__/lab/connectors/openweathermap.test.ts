// OpenWeatherMap — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/openweathermap';

const config: ConnectorTestConfig = {
  connectorId: 'test-openweathermap',
  connectorType: 'source',
  engine: 'openweathermap',
  config: {
    host: 'https://api.openweathermap.org/data/2.5',
  },
  testTables: ['weather'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
