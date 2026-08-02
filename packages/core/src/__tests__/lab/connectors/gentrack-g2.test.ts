// gentrack-g2 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gentrack-g2';

const config: ConnectorTestConfig = {
  connectorId: 'test-gentrack-g2',
  connectorType: 'source',
  engine: 'gentrack-g2',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
