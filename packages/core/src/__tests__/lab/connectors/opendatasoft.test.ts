// OpenDataSoft — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/opendatasoft';

const config: ConnectorTestConfig = {
  connectorId: 'test-opendatasoft',
  connectorType: 'source',
  engine: 'opendatasoft',
  config: {
    host: 'https://public.opendatsoutheast.fr/api/explore/v2.1',
  },
  testTables: ['datasets'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
