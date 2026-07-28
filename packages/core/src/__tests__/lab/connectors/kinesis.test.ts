// Kinesis Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/kinesis';

const config: ConnectorTestConfig = {
  connectorId: 'test-kinesis',
  connectorType: 'source',
  engine: 'kinesis',
  config: {
    host: process.env.TEST_KINESIS_HOST || 'localhost',
    port: 4566,
    database: '',
    username: process.env.TEST_KINESIS_USER || '',
    password: process.env.TEST_KINESIS_PASS || '',
    region: 'us-east-1',
    endpoint: 'http://localhost:4566',
  } as any,
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
