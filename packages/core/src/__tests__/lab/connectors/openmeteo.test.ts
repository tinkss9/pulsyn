// Open Meteo Weather API Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/openmeteo';

const config: ConnectorTestConfig = {
  connectorId: 'test-openmeteo',
  connectorType: 'source',
  engine: 'openmeteo',
  config: {
    host: 'https://api.open-meteo.com',
  },
  testTables: ['weather'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
