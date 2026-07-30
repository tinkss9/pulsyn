// @ts-nocheck
// Canvass Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'assets',
    endpoint: '/assets',
    schema: {
      name: 'assets',
      table: 'assets',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('canvass')
export class CanvassConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'canvass', 'canvass', config, {
      baseUrl: config.host || 'https://api.canvass.io/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/assets',
      
    });
  }
}
