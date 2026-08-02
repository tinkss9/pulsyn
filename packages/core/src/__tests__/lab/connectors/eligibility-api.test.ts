// eligibility-api Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/eligibility-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-eligibility-api',
  connectorType: 'source',
  engine: 'eligibility-api',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
