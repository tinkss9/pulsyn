// Timezone API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/timezoneapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-timezoneapi',
  connectorType: 'source',
  engine: 'timezoneapi',
  config: {
    host: 'https://worldtimeapi.org/api',
  },
  testTables: ['timezones', 'current'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
