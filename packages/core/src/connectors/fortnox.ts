// @ts-nocheck
// Fortnox Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'invoices',
    endpoint: '/invoices',
    schema: {
      name: 'invoices',
      table: 'invoices',
      columns: [
      { name: 'DocumentNumber', type: 'number', nullable: false, primaryKey: true },
      { name: 'Total', type: 'number', nullable: true },
      { name: 'InvoiceDate', type: 'date', nullable: true },
      ],
      primaryKey: ['DocumentNumber'],
    },
    idField: 'DocumentNumber',
    
  },
];

@registerSource('fortnox')
export class FortnoxConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'fortnox', 'fortnox', config, {
      baseUrl: config.host || 'https://api.fortnox.se/3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/invoices',
      
    });
  }
}
