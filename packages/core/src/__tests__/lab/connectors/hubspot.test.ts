// HubSpot Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hubspot';

const config: ConnectorTestConfig = {
  connectorId: 'test-hubspot',
  connectorType: 'source',
  engine: 'hubspot',
  config: {
    host: 'api.hubapi.com',
    port: 443,
    database: '',
    username: '',
    password: '',
    accessToken: process.env.TEST_HUBSPOT_ACCESS_TOKEN || '',
    apiKey: process.env.TEST_HUBSPOT_API_KEY || '',
    ssl: true,
  } as any,
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
