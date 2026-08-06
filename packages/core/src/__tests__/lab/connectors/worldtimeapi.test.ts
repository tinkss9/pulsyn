// WorldTimeAPI — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/worldtimeapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-worldtimeapi',
  connectorType: 'source',
  engine: 'worldtimeapi',
  config: { host: 'https://worldtimeapi.org/api' },
  testTables: ['timezones', 'ip'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
