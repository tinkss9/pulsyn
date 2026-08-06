// IP API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ipapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-ipapi',
  connectorType: 'source',
  engine: 'ipapi',
  config: {
    host: 'https://ipapi.co',
  },
  testTables: ['ip'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
