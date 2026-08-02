// canvas-lms Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/canvas-lms';

const config: ConnectorTestConfig = {
  connectorId: 'test-canvas-lms',
  connectorType: 'source',
  engine: 'canvas-lms',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
