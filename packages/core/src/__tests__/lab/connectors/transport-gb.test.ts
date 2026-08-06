// Transport for GB — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/transport-gb';

const config: ConnectorTestConfig = {
  connectorId: 'test-transport-gb',
  connectorType: 'source',
  engine: 'transport-gb',
  config: {
    host: 'https://transportapi.com/v3',
  },
  testTables: ['places'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
