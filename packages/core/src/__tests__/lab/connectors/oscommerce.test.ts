// oscommerce Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/oscommerce';

const config: ConnectorTestConfig = {
  connectorId: 'test-oscommerce',
  connectorType: 'source',
  engine: 'oscommerce',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
