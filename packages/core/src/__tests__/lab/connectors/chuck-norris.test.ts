// Chuck Norris v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/chuck-norris';

const config: ConnectorTestConfig = {
  connectorId: 'test-chuck-norris',
  connectorType: 'source',
  engine: 'chuck-norris',
  config: { host: 'https://api.chucknorris.io' },
  testTables: ['categories'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
