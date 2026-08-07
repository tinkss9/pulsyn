// ActiveCampaign API v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/activecampaign-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-activecampaign-real',
  connectorType: 'source',
  engine: 'activecampaign-real',
  config: { host: 'https://{domain}.api-us1.com/api/3' },
  testTables: ['contacts', 'deals', 'campaigns'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
