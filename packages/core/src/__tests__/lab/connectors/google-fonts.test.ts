// Google Fonts — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/google-fonts';

const config: ConnectorTestConfig = {
  connectorId: 'test-google-fonts',
  connectorType: 'source',
  engine: 'google-fonts',
  config: { host: 'https://www.googleapis.com/webfonts/v1' },
  testTables: ['fonts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
