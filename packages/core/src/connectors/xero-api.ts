// Xero API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'invoices', endpoint: '/Invoices?pageSize=20', schema: { name: 'invoices', table: 'invoices', columns: [{ name: 'InvoiceID', type: 'string', nullable: false, primaryKey: true }, { name: 'Type', type: 'string', nullable: false, primaryKey: false }, { name: 'Status', type: 'string', nullable: false, primaryKey: false }, { name: 'Total', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['InvoiceID'] }, idField: 'InvoiceID' }
];

@registerSource('xero-api')
export class XeroApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'xero-api', 'xero-api', config, {
      baseUrl: config.host || 'https://api.xero.com/api.xro/2.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/Invoices',
    });
  }
}
