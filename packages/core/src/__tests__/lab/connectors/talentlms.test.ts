// talentlms Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/talentlms';

const config: ConnectorTestConfig = {
  connectorId: 'test-talentlms',
  connectorType: 'source',
  engine: 'talentlms',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
