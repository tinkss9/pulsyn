// Yu-Gi-Oh Cards — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/yugioh-cards';

const config: ConnectorTestConfig = {
  connectorId: 'test-yugioh-cards',
  connectorType: 'source',
  engine: 'yugioh-cards',
  config: { host: 'https://db.ygoprodeck.com/api/v7' },
  testTables: ['cards'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
