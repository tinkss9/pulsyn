// OpenWeatherMap Free — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/openweathermap-free';

const config: ConnectorTestConfig = {
  connectorId: 'test-openweathermap-free',
  connectorType: 'source',
  engine: 'openweathermap-free',
  config: { host: 'https://api.openweathermap.org/data/2.5' },
  testTables: ['weather'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
