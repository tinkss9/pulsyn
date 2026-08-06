// Useless Facts — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/useless-facts';

const config: ConnectorTestConfig = {
  connectorId: 'test-useless-facts',
  connectorType: 'source',
  engine: 'useless-facts',
  config: { host: 'https://uselessfacts.jsph.pl/api/v2' },
  testTables: ['facts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
