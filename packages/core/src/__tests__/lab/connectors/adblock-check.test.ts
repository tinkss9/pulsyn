// Adblock Check — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/adblock-check';

const config: ConnectorTestConfig = {
  connectorId: 'test-adblock-check',
  connectorType: 'source',
  engine: 'adblock-check',
  config: { host: 'https://adblock-checker.p.rapidapi.com' },
  testTables: ['check'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
