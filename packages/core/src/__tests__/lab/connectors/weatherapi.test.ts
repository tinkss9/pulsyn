// WeatherAPI — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/weatherapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-weatherapi',
  connectorType: 'source',
  engine: 'weatherapi',
  config: {
    host: 'https://api.weatherapi.com/v1',
  },
  testTables: ['current'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
