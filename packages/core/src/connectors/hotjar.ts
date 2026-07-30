// @ts-nocheck
// Hotjar Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'surveys',
    endpoint: '/sites/{siteId}/surveys',
    schema: {
      name: 'surveys',
      table: 'surveys',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('hotjar')
export class HotjarConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'hotjar', 'hotjar', config, {
      baseUrl: config.host || 'https://insights.hotjar.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/sites',
      
    });
  }
}
