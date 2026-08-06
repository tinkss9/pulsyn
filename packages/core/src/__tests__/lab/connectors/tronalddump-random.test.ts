// Tronald Dump Random — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tronalddump-random';

const config: ConnectorTestConfig = {
  connectorId: 'test-tronalddump-random',
  connectorType: 'source',
  engine: 'tronalddump-random',
  config: { host: 'https://api.tronalddump.io' },
  testTables: ['random'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
