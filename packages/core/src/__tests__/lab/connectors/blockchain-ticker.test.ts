// Blockchain Ticker — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/blockchain-ticker';

const config: ConnectorTestConfig = {
  connectorId: 'test-blockchain-ticker',
  connectorType: 'source',
  engine: 'blockchain-ticker',
  config: { host: 'https://blockchain.info' },
  testTables: ['ticker'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
