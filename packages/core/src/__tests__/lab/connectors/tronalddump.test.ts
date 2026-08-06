// Tronald Dump — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tronalddump';

const config: ConnectorTestConfig = {
  connectorId: 'test-tronalddump',
  connectorType: 'source',
  engine: 'tronalddump',
  config: {
    host: 'https://api.tronalddump.io',
  },
  testTables: ['quotes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
