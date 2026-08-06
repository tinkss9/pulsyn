// Yu-Gi-Oh API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/keycloak';

const config: ConnectorTestConfig = {
  connectorId: 'test-keycloak',
  connectorType: 'source',
  engine: 'keycloak',
  config: {
    host: 'https://db.ygoprodeck.com/api/v7',
  },
  testTables: ['cards'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
