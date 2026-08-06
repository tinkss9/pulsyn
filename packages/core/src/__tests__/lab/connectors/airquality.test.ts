// AQICN Air Quality — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/airquality';

const config: ConnectorTestConfig = {
  connectorId: 'test-airquality',
  connectorType: 'source',
  engine: 'airquality',
  config: {
    host: 'https://api.waqi.info',
  },
  testTables: ['feed'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
