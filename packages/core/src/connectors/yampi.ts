// @ts-nocheck
// Yampi Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'orders',
    endpoint: '/orders',
    schema: {
      name: 'orders',
      table: 'orders',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'total', type: 'number', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('yampi')
export class YampiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'yampi', 'yampi', config, {
      baseUrl: config.host || 'https://api.yampi.io/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/orders',
      
    });
  }
}
