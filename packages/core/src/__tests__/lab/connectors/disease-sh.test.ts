// Disease.sh COVID — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/disease-sh';

const config: ConnectorTestConfig = {
  connectorId: 'test-disease-sh',
  connectorType: 'source',
  engine: 'disease-sh',
  config: {
    host: 'https://disease.sh/v3/covid-19',
  },
  testTables: ['global', 'countries'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
