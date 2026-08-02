// Kafka Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/kafka-source';

const config: ConnectorTestConfig = {
  connectorId: 'test-kafka',
  connectorType: 'source',
  engine: 'kafka',
  config: {
    host: process.env.TEST_KAFKA_HOST || 'localhost:9092',
    port: 9092,
    database: '',
    username: process.env.TEST_KAFKA_USER || '',
    password: process.env.TEST_KAFKA_PASS || '',
    ssl: false,
  },
  testTables: ['testdb'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
  testTimeout: 15000,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
