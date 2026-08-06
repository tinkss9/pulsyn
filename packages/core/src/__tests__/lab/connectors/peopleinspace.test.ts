// People in Space — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/peopleinspace';

const config: ConnectorTestConfig = {
  connectorId: 'test-peopleinspace',
  connectorType: 'source',
  engine: 'peopleinspace',
  config: { host: 'http://api.open-notify.org' },
  testTables: ['people'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
