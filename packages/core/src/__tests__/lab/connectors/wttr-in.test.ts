// wttr.in Weather — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/wttr-in';

const config: ConnectorTestConfig = {
  connectorId: 'test-wttr-in',
  connectorType: 'source',
  engine: 'wttr-in',
  config: { host: 'https://wttr.in' },
  testTables: ['weather'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
