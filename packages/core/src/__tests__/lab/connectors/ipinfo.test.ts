// IPInfo — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ipinfo';

const config: ConnectorTestConfig = {
  connectorId: 'test-ipinfo',
  connectorType: 'source',
  engine: 'ipinfo',
  config: {
    host: 'https://ipinfo.io',
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
