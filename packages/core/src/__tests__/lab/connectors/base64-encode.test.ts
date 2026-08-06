// Base64 Encode — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/base64-encode';

const config: ConnectorTestConfig = {
  connectorId: 'test-base64-encode',
  connectorType: 'source',
  engine: 'base64-encode',
  config: { host: 'https://api.allorigins.win' },
  testTables: ['proxy'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
