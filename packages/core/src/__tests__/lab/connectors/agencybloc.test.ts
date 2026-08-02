// agencybloc Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/agencybloc';

const config: ConnectorTestConfig = {
  connectorId: 'test-agencybloc',
  connectorType: 'source',
  engine: 'agencybloc',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
