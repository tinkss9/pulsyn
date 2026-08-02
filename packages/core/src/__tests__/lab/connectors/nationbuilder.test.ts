// nationbuilder Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nationbuilder';

const config: ConnectorTestConfig = {
  connectorId: 'test-nationbuilder',
  connectorType: 'source',
  engine: 'nationbuilder',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
