// ghost-newsletter Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ghost-newsletter';

const config: ConnectorTestConfig = {
  connectorId: 'test-ghost-newsletter',
  connectorType: 'source',
  engine: 'ghost-newsletter',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
