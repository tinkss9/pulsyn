// @ts-nocheck
// Flexiti Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'applications',
    endpoint: '/applications',
    schema: {
      name: 'applications',
      table: 'applications',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('flexiti')
export class FlexitiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'flexiti', 'flexiti', config, {
      baseUrl: config.host || 'https://api.flexiti.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/applications',
      
    });
  }
}
