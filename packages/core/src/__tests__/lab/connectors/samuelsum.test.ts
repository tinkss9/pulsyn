// Samuel L Ipsum — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/samuelsum';

const config: ConnectorTestConfig = {
  connectorId: 'test-samuelsum',
  connectorType: 'source',
  engine: 'samuelsum',
  config: { host: 'https://samuelipsum.com' },
  testTables: ['text'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
