// mqtt Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mqtt';

const config: ConnectorTestConfig = {
  connectorId: 'test-mqtt',
  connectorType: 'source',
  engine: 'mqtt',
  config: { host: process.env.TEST_MQTT_HOST || 'localhost', port: 5672, database: '', username: '', password: '' },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();