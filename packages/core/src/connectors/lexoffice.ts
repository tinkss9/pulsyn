// @ts-nocheck
// Lexoffice Connector — Auto-generated from config
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
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'invoiceNumber', type: 'string', nullable: true },
      { name: 'totalAmount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('lexoffice')
export class LexofficeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lexoffice', 'lexoffice', config, {
      baseUrl: config.host || 'https://api.lexoffice.io/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/contacts',
      
    });
  }
}
