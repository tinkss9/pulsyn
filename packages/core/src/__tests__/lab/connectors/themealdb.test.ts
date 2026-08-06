// TheMealDB — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/themealdb';

const config: ConnectorTestConfig = {
  connectorId: 'test-themealdb',
  connectorType: 'source',
  engine: 'themealdb',
  config: {
    host: 'https://www.themealdb.com/api/json/v1/1',
  },
  testTables: ['categories', 'areas'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
