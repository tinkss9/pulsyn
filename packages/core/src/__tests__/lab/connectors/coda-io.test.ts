// coda-io Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/coda-io';

const config: ConnectorTestConfig = {
  connectorId: 'test-coda-io',
  connectorType: 'source',
  engine: 'coda-io',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
