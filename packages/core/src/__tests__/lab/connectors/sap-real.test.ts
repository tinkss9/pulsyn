// SAP — Comprehensive Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sap-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-sap-real',
  connectorType: 'source',
  engine: 'sap-real',
  config: { host: 'https://{host}/sap/opu/odata/sap/API_BUSINESS_PARTNER' },
  testTables: ['A_BusinessPartner', 'A_SalesOrder', 'A_Customer'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
