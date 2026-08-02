// route-mobile Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/route-mobile';

const config: ConnectorTestConfig = {
  connectorId: 'test-route-mobile',
  connectorType: 'source',
  engine: 'route-mobile',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
