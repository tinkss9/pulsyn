// zoom Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zoom';

const config: ConnectorTestConfig = {
  connectorId: 'test-zoom',
  connectorType: 'source',
  engine: 'zoom',
  config: { host: 'api.zoom.com', port: 443, database: '', username: '', password: 'test', ssl: true },
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