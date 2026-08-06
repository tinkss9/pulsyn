// Nutritionix — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nutritionix';

const config: ConnectorTestConfig = {
  connectorId: 'test-nutritionix',
  connectorType: 'source',
  engine: 'nutritionix',
  config: {
    host: 'https://trackapi.nutritionix.com/v2',
  },
  testTables: ['nutrients'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
