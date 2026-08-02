// numbersapi Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/numbersapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-numbersapi',
  connectorType: 'source',
  engine: 'numbersapi',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
