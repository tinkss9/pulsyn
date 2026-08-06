// RubyGems Search — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/rubygems-search';

const config: ConnectorTestConfig = {
  connectorId: 'test-rubygems-search',
  connectorType: 'source',
  engine: 'rubygems-search',
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
