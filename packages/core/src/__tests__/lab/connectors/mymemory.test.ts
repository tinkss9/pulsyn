// MyMemory Translation — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mymemory';

const config: ConnectorTestConfig = {
  connectorId: 'test-mymemory',
  connectorType: 'source',
  engine: 'mymemory',
  config: {
    host: 'https://api.mymemory.translated.net',
  },
  testTables: ['translate'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
