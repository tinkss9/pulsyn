// Constant Contact API v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/constant-contact-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-constant-contact-real',
  connectorType: 'source',
  engine: 'constant-contact-real',
  config: { host: 'https://api.cc.email/v3' },
  testTables: ['contacts', 'lists', 'campaigns'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
