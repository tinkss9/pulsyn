// Public APIs Random — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/publicapis-random';

const config: ConnectorTestConfig = {
  connectorId: 'test-publicapis-random',
  connectorType: 'source',
  engine: 'publicapis-random',
  config: { host: 'https://api.publicapis.org' },
  testTables: ['random'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
