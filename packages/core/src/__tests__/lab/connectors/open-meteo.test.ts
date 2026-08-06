// Open-Meteo Weather — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/open-meteo';

const config: ConnectorTestConfig = {
  connectorId: 'test-open-meteo',
  connectorType: 'source',
  engine: 'open-meteo',
  config: { host: 'https://api.open-meteo.com/v1' },
  testTables: ['forecast'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
