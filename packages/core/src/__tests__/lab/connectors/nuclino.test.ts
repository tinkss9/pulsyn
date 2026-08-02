// nuclino Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nuclino';

const config: ConnectorTestConfig = {
  connectorId: 'test-nuclino',
  connectorType: 'source',
  engine: 'nuclino',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
