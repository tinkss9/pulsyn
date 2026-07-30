// @ts-nocheck
// Katana MRP Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'items',
    endpoint: '/items',
    schema: {
      name: 'items',
      table: 'items',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('katana-mrp')
export class KatanaMRPConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'katana-mrp', 'katana-mrp', config, {
      baseUrl: config.host || 'https://api.katana.mrpeasy.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/items',
      
    });
  }
}
