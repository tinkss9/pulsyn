// @ts-nocheck
// QuickBooks Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'customers', endpoint: '/v3/company/{realmId}/query?query=SELECT * FROM Customer', schema: { name: 'customers', table: 'customers', columns: [
    { name: 'Id', type: 'string', nullable: false, primaryKey: true }, { name: 'DisplayName', type: 'string', nullable: false },
    { name: 'PrimaryEmailAddr', type: 'string', nullable: true }, { name: 'PrimaryPhone', type: 'string', nullable: true },
    { name: 'MetaData', type: 'object', nullable: true },
  ], primaryKey: ['Id'] }, idField: 'Id' },
  { name: 'invoices', endpoint: '/v3/company/{realmId}/query?query=SELECT * FROM Invoice', schema: { name: 'invoices', table: 'invoices', columns: [
    { name: 'Id', type: 'string', nullable: false, primaryKey: true }, { name: 'DocNumber', type: 'string', nullable: true },
    { name: 'TotalAmt', type: 'number', nullable: true }, { name: 'Balance', type: 'number', nullable: true },
    { name: 'TxnDate', type: 'date', nullable: true },
  ], primaryKey: ['Id'] }, idField: 'Id' },
];

@registerSource('quickbooks')
export class QuickBooksConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'quickbooks', 'quickbooks', config, {
      baseUrl: config.host || 'https://quickbooks.api.intuit.com',
      authType: 'oauth2_refresh',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/v3/company/{realmId}/companyinfo/{realmId}',
    });
  }
}
