// UUID Generator — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/uuid-generator';

const config: ConnectorTestConfig = {
  connectorId: 'test-uuid-generator',
  connectorType: 'source',
  engine: 'uuid-generator',
  config: { host: 'https://uuidgen.com' },
  testTables: ['uuids'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
