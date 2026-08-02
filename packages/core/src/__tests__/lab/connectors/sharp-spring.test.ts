// sharp-spring Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sharp-spring';

const config: ConnectorTestConfig = {
  connectorId: 'test-sharp-spring',
  connectorType: 'source',
  engine: 'sharp-spring',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
