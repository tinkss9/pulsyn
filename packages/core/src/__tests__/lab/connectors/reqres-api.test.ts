// ReqRes API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/reqres-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-reqres-api',
  connectorType: 'source',
  engine: 'reqres-api',
  config: {
    host: 'https://reqres.in/api',
  },
  testTables: ['users'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
