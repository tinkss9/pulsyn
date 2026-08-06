// Pokemon TCG — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pokemontcg';

const config: ConnectorTestConfig = {
  connectorId: 'test-pokemontcg',
  connectorType: 'source',
  engine: 'pokemontcg',
  config: {
    host: 'https://api.pokemontcg.io/v2',
  },
  testTables: ['cards', 'types'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
