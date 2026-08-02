// alibaba Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/alibaba';

const config: ConnectorTestConfig = {
  connectorId: 'test-alibaba',
  connectorType: 'source',
  engine: 'alibaba',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
