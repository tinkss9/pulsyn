// CoinGecko Coins — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/coingecko-coins';

const config: ConnectorTestConfig = {
  connectorId: 'test-coingecko-coins',
  connectorType: 'source',
  engine: 'coingecko-coins',
  config: { host: 'https://api.coingecko.com/api/v3' },
  testTables: ['coins', 'global'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
