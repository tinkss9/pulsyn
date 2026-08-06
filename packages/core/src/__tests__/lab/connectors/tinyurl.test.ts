// TinyURL — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tinyurl';

const config: ConnectorTestConfig = {
  connectorId: 'test-tinyurl',
  connectorType: 'source',
  engine: 'tinyurl',
  config: { host: 'https://tinyurl.com/api-create.php' },
  testTables: ['shorten'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
