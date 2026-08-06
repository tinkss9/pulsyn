// HubSpot Real Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hubspot-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-hubspot-real',
  connectorType: 'source',
  engine: 'hubspot-real',
  config: {
    host: 'https://api.hubapi.com',
    // token: '<HubSpot Private App token pat-na1-*>',
  },
  testTables: ['contacts', 'companies', 'deals'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
