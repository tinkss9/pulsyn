// @ts-nocheck
// Losant Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'devices',
    endpoint: '/applications/{appId}/devices',
    schema: {
      name: 'devices',
      table: 'devices',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'description', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('losant')
export class LosantConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'losant', 'losant', config, {
      baseUrl: config.host || 'https://api.losant.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/applications',
      
    });
  }
}
