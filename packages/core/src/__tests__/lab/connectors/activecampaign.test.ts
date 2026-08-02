// activecampaign Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/activecampaign';

const config: ConnectorTestConfig = {
  connectorId: 'test-activecampaign',
  connectorType: 'source',
  engine: 'activecampaign',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
