// Facebook Marketing — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/facebook-marketing';

const config: ConnectorTestConfig = {
  connectorId: 'test-facebook-marketing',
  connectorType: 'source',
  engine: 'facebook-marketing',
  config: { host: 'https://graph.facebook.com/v19.0' },
  testTables: ['campaigns'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
