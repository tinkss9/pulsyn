// Pokemon TCG v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pokemontcg-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-pokemontcg-v2',
  connectorType: 'source',
  engine: 'pokemontcg-v2',
  config: { host: 'https://api.pokemontcg.io/v2' },
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
