// @ts-nocheck
// Xero Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'invoices', endpoint: '/api.xro/2.0/Invoices', schema: { name: 'invoices', table: 'invoices', columns: [
    { name: 'InvoiceID', type: 'string', nullable: false, primaryKey: true }, { name: 'Type', type: 'string', nullable: false },
    { name: 'InvoiceNumber', type: 'string', nullable: true }, { name: 'Total', type: 'number', nullable: true },
    { name: 'Date', type: 'date', nullable: true }, { name: 'UpdatedDateUTC', type: 'datetime', nullable: true },
  ], primaryKey: ['InvoiceID'] }, idField: 'InvoiceID', modifiedField: 'UpdatedDateUTC' },
  { name: 'contacts', endpoint: '/api.xro/2.0/Contacts', schema: { name: 'contacts', table: 'contacts', columns: [
    { name: 'ContactID', type: 'string', nullable: false, primaryKey: true }, { name: 'Name', type: 'string', nullable: false },
    { name: 'EmailAddress', type: 'string', nullable: true }, { name: 'UpdatedDateUTC', type: 'datetime', nullable: true },
  ], primaryKey: ['ContactID'] }, idField: 'ContactID', modifiedField: 'UpdatedDateUTC' },
];

@registerSource('xero')
export class XeroConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'xero', 'xero', config, {
      baseUrl: config.host || 'https://api.xero.com',
      authType: 'oauth2_refresh',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api.xro/2.0/Organisation',
    });
  }
}
