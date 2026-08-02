// climate-fieldview Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/climate-fieldview';

const config: ConnectorTestConfig = {
  connectorId: 'test-climate-fieldview',
  connectorType: 'source',
  engine: 'climate-fieldview',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
