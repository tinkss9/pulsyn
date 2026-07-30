// @ts-nocheck
// Medium Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'publications',
    endpoint: '/users/{userId}/publications',
    schema: {
      name: 'publications',
      table: 'publications',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'description', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('medium')
export class MediumConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'medium', 'medium', config, {
      baseUrl: config.host || 'https://api.medium.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
