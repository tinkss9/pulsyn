// grafana-mimir-v2 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/grafana-mimir-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-grafana-mimir-v2',
  connectorType: 'source',
  engine: 'grafana-mimir-v2',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
