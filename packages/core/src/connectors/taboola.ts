// @ts-nocheck
// Taboola Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'campaigns',
    endpoint: '/advertisers/{advertiserId}/campaigns',
    schema: {
      name: 'campaigns',
      table: 'campaigns',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'branding_text', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('taboola')
export class TaboolaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'taboola', 'taboola', config, {
      baseUrl: config.host || 'https://api.taboola.com/1.2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users/current',
      
    });
  }
}
