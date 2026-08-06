// OpenTripMap — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/opentripmap';

const config: ConnectorTestConfig = {
  connectorId: 'test-opentripmap',
  connectorType: 'source',
  engine: 'opentripmap',
  config: {
    host: 'https://api.opentripmap.com/0.1/en',
  },
  testTables: ['places'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
