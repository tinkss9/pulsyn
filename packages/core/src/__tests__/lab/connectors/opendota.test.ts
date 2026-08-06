// OpenDota — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/opendota';

const config: ConnectorTestConfig = {
  connectorId: 'test-opendota',
  connectorType: 'source',
  engine: 'opendota',
  config: {
    host: 'https://api.opendota.com/api',
  },
  testTables: ['heroes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
