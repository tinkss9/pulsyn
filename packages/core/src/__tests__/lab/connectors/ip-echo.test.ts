// IP Echo — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ip-echo';

const config: ConnectorTestConfig = {
  connectorId: 'test-ip-echo',
  connectorType: 'source',
  engine: 'ip-echo',
  config: { host: 'https://api.ipify.org' },
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
