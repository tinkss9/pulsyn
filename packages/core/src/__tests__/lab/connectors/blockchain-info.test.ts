// Blockchain.info — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/blockchain-info';

const config: ConnectorTestConfig = {
  connectorId: 'test-blockchain-info',
  connectorType: 'source',
  engine: 'blockchain-info',
  config: {
    host: 'https://blockchain.info',
  },
  testTables: ['ticker'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
