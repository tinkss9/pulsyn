// ReqRes Users — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/reqres-users';

const config: ConnectorTestConfig = {
  connectorId: 'test-reqres-users',
  connectorType: 'source',
  engine: 'reqres-users',
  config: { host: 'https://reqres.in/api' },
  testTables: ['users', 'unknown'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
