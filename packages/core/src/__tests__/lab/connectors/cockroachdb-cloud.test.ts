// cockroachdb-cloud Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cockroachdb-cloud';

const config: ConnectorTestConfig = {
  connectorId: 'test-cockroachdb-cloud',
  connectorType: 'source',
  engine: 'cockroachdb-cloud',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
