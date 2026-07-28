// grafana Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/grafana';

const config: ConnectorTestConfig = {
  connectorId: 'test-grafana',
  connectorType: 'source',
  engine: 'grafana',
  config: { host: 'localhost', port: 3000, database: '', username: '', password: 'test', ssl: false },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();