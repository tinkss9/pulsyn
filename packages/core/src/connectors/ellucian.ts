// @ts-nocheck
// Ellucian Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'persons',
    endpoint: '/persons',
    schema: {
      name: 'persons',
      table: 'persons',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('ellucian')
export class EllucianConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ellucian', 'ellucian', config, {
      baseUrl: config.host || 'https://api.ellucian.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/persons',
      
    });
  }
}
