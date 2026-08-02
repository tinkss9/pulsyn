// soundcloud Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/soundcloud';

const config: ConnectorTestConfig = {
  connectorId: 'test-soundcloud',
  connectorType: 'source',
  engine: 'soundcloud',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
