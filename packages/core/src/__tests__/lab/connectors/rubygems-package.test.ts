// RubyGems Package — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/rubygems-package';

const config: ConnectorTestConfig = {
  connectorId: 'test-rubygems-package',
  connectorType: 'source',
  engine: 'rubygems-package',
  config: { host: 'https://rubygems.org/api/v1' },
  testTables: ['gems'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
