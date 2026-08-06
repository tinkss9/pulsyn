// zendesk-real — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zendesk-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-zendesk-real',
  connectorType: 'source',
  engine: 'zendesk-real',
  config: { host: 'https://api.example.com' },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();

