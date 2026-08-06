// RemoteOK — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/remoteok';

const config: ConnectorTestConfig = {
  connectorId: 'test-remoteok',
  connectorType: 'source',
  engine: 'remoteok',
  config: {
    host: 'https://remoteok.com/api',
  },
  testTables: ['jobs'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
