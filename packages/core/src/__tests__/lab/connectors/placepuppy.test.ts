// PlacePuppy — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/placepuppy';

const config: ConnectorTestConfig = {
  connectorId: 'test-placepuppy',
  connectorType: 'source',
  engine: 'placepuppy',
  config: {
    host: 'https://place-puppy.com',
  },
  testTables: ['images'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
