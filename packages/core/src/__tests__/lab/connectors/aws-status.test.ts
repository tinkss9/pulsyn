// AWS Health — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/aws-status';

const config: ConnectorTestConfig = {
  connectorId: 'test-aws-status',
  connectorType: 'source',
  engine: 'aws-status',
  config: { host: 'https://health.aws.amazon.com' },
  testTables: ['status'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
