// IP Whois — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ipwhois';

const config: ConnectorTestConfig = {
  connectorId: 'test-ipwhois',
  connectorType: 'source',
  engine: 'ipwhois',
  config: { host: 'https://ipwho.is' },
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
