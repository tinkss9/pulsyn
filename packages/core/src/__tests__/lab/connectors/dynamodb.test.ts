// DynamoDB Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dynamodb';

const config: ConnectorTestConfig = {
  connectorId: 'test-dynamodb',
  connectorType: 'source',
  engine: 'dynamodb',
  config: {
    host: process.env.TEST_DYNAMODB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DYNAMODB_PORT || '8000'),
    database: process.env.TEST_DYNAMODB_DB || 'testdb',
    username: process.env.TEST_DYNAMODB_USER || 'test',
    password: process.env.TEST_DYNAMODB_PASS || 'test',
    region: 'us-east-1',
    endpoint: 'http://localhost:8000',
  } as any,
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
