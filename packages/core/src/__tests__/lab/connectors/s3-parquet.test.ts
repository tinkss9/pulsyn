// s3-parquet Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/s3-parquet-target';

const config: ConnectorTestConfig = {
  connectorId: 'test-s3-parquet',
  connectorType: 'target',
  engine: 's3-parquet',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
