// surveymonkey Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/surveymonkey';

const config: ConnectorTestConfig = {
  connectorId: 'test-surveymonkey',
  connectorType: 'source',
  engine: 'surveymonkey',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
