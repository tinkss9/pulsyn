// jobvite Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/jobvite';

const config: ConnectorTestConfig = {
  connectorId: 'test-jobvite',
  connectorType: 'source',
  engine: 'jobvite',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
