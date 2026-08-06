// World Bank API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/worldbank';

const config: ConnectorTestConfig = {
  connectorId: 'test-worldbank',
  connectorType: 'source',
  engine: 'worldbank',
  config: {
    host: 'https://api.worldbank.org/v2',
  },
  testTables: ['countries', 'indicators'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
