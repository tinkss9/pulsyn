// Public APIs List — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/public-apis-list';

const config: ConnectorTestConfig = {
  connectorId: 'test-public-apis-list',
  connectorType: 'source',
  engine: 'public-apis-list',
  config: { host: 'https://api.publicapis.org' },
  testTables: ['entries'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
