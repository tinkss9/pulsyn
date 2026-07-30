// @ts-nocheck
// Exact Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'invoices',
    endpoint: '/salesinvoice/SalesInvoices',
    schema: {
      name: 'invoices',
      table: 'invoices',
      columns: [
      { name: 'InvoiceID', type: 'string', nullable: false, primaryKey: true },
      { name: 'InvoiceNumber', type: 'number', nullable: true },
      { name: 'AmountDC', type: 'number', nullable: true },
      { name: 'Created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['InvoiceID'],
    },
    idField: 'InvoiceID',
    
  },
];

@registerSource('exact')
export class ExactConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'exact', 'exact', config, {
      baseUrl: config.host || 'https://api.exactonline.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/current/Me',
      
    });
  }
}
