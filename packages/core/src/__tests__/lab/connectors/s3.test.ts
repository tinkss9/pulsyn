// S3/MinIO Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/s3';

const config: ConnectorTestConfig = {
  connectorId: 'test-s3',
  connectorType: 'source',
  engine: 's3',
  config: {
    host: process.env.TEST_S3_HOST || 'localhost',
    port: parseInt(process.env.TEST_S3_PORT || '4566'),
    database: 'test-bucket',
    accessKeyId: 'test',
    secretAccessKey: 'testtest',
    endpoint: 'http://localhost:4566',
    forcePathStyle: true,
    region: 'us-east-1',
  } as any,
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
