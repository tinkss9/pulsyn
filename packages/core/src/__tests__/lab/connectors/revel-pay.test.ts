// revel-pay Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/revel-pay';

const config: ConnectorTestConfig = {
  connectorId: 'test-revel-pay',
  connectorType: 'source',
  engine: 'revel-pay',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
