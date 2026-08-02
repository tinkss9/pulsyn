// grafana-mimir Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/grafana-mimir';

const config: ConnectorTestConfig = {
  connectorId: 'test-grafana-mimir',
  connectorType: 'source',
  engine: 'grafana-mimir',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
