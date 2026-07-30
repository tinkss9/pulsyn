// @ts-nocheck
// Fibery Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'entities',
    endpoint: '/entities',
    schema: {
      name: 'entities',
      table: 'entities',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('fibery')
export class FiberyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'fibery', 'fibery', config, {
      baseUrl: config.host || 'https://your-domain.fibery.io/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/entities',
      
    });
  }
}
