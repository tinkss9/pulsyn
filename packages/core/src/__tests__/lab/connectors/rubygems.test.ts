// RubyGems API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/rubygems';

const config: ConnectorTestConfig = {
  connectorId: 'test-rubygems',
  connectorType: 'source',
  engine: 'rubygems',
  config: {
    host: 'https://rubygems.org/api/v1',
  },
  testTables: ['gems'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
