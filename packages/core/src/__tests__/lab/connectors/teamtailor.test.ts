// teamtailor Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/teamtailor';

const config: ConnectorTestConfig = {
  connectorId: 'test-teamtailor',
  connectorType: 'source',
  engine: 'teamtailor',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
