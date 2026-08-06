// World Bank Indicators — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/worldbank-indicators';

const config: ConnectorTestConfig = {
  connectorId: 'test-worldbank-indicators',
  connectorType: 'source',
  engine: 'worldbank-indicators',
  config: { host: 'https://api.worldbank.org/v2' },
  testTables: ['indicators', 'countries'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
