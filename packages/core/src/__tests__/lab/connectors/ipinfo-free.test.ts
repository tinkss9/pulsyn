// IPInfo Free — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ipinfo-free';

const config: ConnectorTestConfig = {
  connectorId: 'test-ipinfo-free',
  connectorType: 'source',
  engine: 'ipinfo-free',
  config: { host: 'https://ipinfo.io' },
  testTables: ['ip'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
