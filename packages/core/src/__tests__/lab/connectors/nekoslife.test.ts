// Nekos.life — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nekoslife';

const config: ConnectorTestConfig = {
  connectorId: 'test-nekoslife',
  connectorType: 'source',
  engine: 'nekoslife',
  config: {
    host: 'https://nekos.life/api/v2',
  },
  testTables: ['img'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
