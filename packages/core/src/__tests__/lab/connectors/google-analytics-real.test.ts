// Google Analytics Real Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/google-analytics-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-google-analytics-real',
  connectorType: 'source',
  engine: 'google-analytics-real',
  config: {
    host: 'https://analyticsdata.googleapis.com',
    // token: '<Google Analytics access token>',
    // database: 'properties/<GA4 Property ID>',
  },
  testTables: ['report', 'traffic_sources', 'page_views'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
