// twilio-video Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/twilio-video';

const config: ConnectorTestConfig = {
  connectorId: 'test-twilio-video',
  connectorType: 'source',
  engine: 'twilio-video',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
