// Chuck Norris Random — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/chuck-norris-random';

const config: ConnectorTestConfig = {
  connectorId: 'test-chuck-norris-random',
  connectorType: 'source',
  engine: 'chuck-norris-random',
  config: { host: 'https://api.chucknorris.io' },
  testTables: ['random', 'categories'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
