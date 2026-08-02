// IP API Connector — Full Lab Test Suite
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
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
