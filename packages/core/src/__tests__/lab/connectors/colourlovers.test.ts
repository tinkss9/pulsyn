// COLOURlovers — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/colourlovers';

const config: ConnectorTestConfig = {
  connectorId: 'test-colourlovers',
  connectorType: 'source',
  engine: 'colourlovers',
  config: { host: 'https://www.colourlovers.com/api' },
  testTables: ['colors'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
