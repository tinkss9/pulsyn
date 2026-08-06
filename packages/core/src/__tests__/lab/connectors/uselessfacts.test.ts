// Useless Facts — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/uselessfacts';

const config: ConnectorTestConfig = {
  connectorId: 'test-uselessfacts',
  connectorType: 'source',
  engine: 'uselessfacts',
  config: {
    host: 'https://uselessfacts.jsph.pl/api/v2',
  },
  testTables: ['facts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
