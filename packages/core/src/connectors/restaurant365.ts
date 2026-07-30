// @ts-nocheck
// Restaurant365 Connector — Auto-generated from config
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
      { name: 'amount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('restaurant365')
export class Restaurant365Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'restaurant365', 'restaurant365', config, {
      baseUrl: config.host || 'https://api.restaurant365.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/invoices',
      
    });
  }
}
