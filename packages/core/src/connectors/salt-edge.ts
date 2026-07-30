// @ts-nocheck
// Salt Edge Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'accounts',
    endpoint: '/accounts',
    schema: {
      name: 'accounts',
      table: 'accounts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'balance', type: 'number', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('salt-edge')
export class SaltEdgeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'salt-edge', 'salt-edge', config, {
      baseUrl: config.host || 'https://www.saltedge.com/api/v5',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/customers',
      
    });
  }
}
