// practicepanther Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/practicepanther';

const config: ConnectorTestConfig = {
  connectorId: 'test-practicepanther',
  connectorType: 'source',
  engine: 'practicepanther',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
