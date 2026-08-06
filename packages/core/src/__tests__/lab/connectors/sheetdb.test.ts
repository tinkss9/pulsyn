// SheetDB — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sheetdb';

const config: ConnectorTestConfig = {
  connectorId: 'test-sheetdb',
  connectorType: 'source',
  engine: 'sheetdb',
  config: {
    host: 'https://sheetdb.io/api/v1',
  },
  testTables: ['rows'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
