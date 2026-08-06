// NASA TechPort — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nasa-techport';

const config: ConnectorTestConfig = {
  connectorId: 'test-nasa-techport',
  connectorType: 'source',
  engine: 'nasa-techport',
  config: { host: 'https://techport.nasa.gov/api' },
  testTables: ['projects'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
