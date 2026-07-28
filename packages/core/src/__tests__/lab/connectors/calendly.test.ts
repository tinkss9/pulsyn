// calendly Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/calendly';

const config: ConnectorTestConfig = {
  connectorId: 'test-calendly',
  connectorType: 'source',
  engine: 'calendly',
  config: { host: 'api.calendly.com', port: 443, database: '', username: '', password: 'test', ssl: true },
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