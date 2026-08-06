// TheMealDB Categories — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/themealdb-categories';

const config: ConnectorTestConfig = {
  connectorId: 'test-themealdb-categories',
  connectorType: 'source',
  engine: 'themealdb-categories',
  config: { host: 'https://www.themealdb.com/api/json/v1/1' },
  testTables: ['categories'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
