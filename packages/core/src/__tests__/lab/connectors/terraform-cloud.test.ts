// terraform-cloud Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/terraform-cloud';

const config: ConnectorTestConfig = {
  connectorId: 'test-terraform-cloud',
  connectorType: 'source',
  engine: 'terraform-cloud',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
