// wttr.in Weather — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/wttr';

const config: ConnectorTestConfig = {
  connectorId: 'test-wttr',
  connectorType: 'source',
  engine: 'wttr',
  config: {
    host: 'https://wttr.in',
  },
  testTables: ['weather'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
