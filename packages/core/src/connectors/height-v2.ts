// @ts-nocheck
// Height v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'lists',
    endpoint: '/lists',
    schema: {
      name: 'lists',
      table: 'lists',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('height-v2')
export class Heightv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'height-v2', 'height-v2', config, {
      baseUrl: config.host || 'https://api.height.app/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/lists',
      
    });
  }
}
