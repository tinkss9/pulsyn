// BoardGameGeek XML — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/boardgamegeek';

const config: ConnectorTestConfig = {
  connectorId: 'test-boardgamegeek',
  connectorType: 'source',
  engine: 'boardgamegeek',
  config: {
    host: 'https://boardgamegeek.com/xmlapi2',
  },
  testTables: ['hot'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
