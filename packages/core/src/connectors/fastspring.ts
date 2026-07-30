// @ts-nocheck
// FastSpring Connector — Auto-generated from config
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
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'total', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('fastspring')
export class FastSpringConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'fastspring', 'fastspring', config, {
      baseUrl: config.host || 'https://api.fastspring.com',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/accounts',
      
    });
  }
}
