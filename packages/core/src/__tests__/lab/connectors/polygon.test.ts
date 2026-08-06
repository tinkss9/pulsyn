// Polygon.io — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/polygon';

const config: ConnectorTestConfig = {
  connectorId: 'test-polygon',
  connectorType: 'source',
  engine: 'polygon',
  config: {
    host: 'https://api.polygon.io',
  },
  testTables: ['tickers'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
