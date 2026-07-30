// @ts-nocheck
// MX Technologies Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'accounts',
    endpoint: '/users/{userGuid}/accounts',
    schema: {
      name: 'accounts',
      table: 'accounts',
      columns: [
      { name: 'guid', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'balance', type: 'number', nullable: true },
      ],
      primaryKey: ['guid'],
    },
    idField: 'guid',
    
  },
];

@registerSource('mx')
export class MXTechnologiesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mx', 'mx', config, {
      baseUrl: config.host || 'https://int-api.mx.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users',
      
    });
  }
}
