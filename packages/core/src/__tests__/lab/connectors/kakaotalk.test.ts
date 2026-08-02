// kakaotalk Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/kakaotalk';

const config: ConnectorTestConfig = {
  connectorId: 'test-kakaotalk',
  connectorType: 'source',
  engine: 'kakaotalk',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
