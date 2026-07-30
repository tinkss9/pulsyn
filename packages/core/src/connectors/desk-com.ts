// @ts-nocheck
// Desk.com Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'cases',
    endpoint: '/cases',
    schema: {
      name: 'cases',
      table: 'cases',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'subject', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('desk-com')
export class DeskcomConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'desk-com', 'desk-com', config, {
      baseUrl: config.host || 'https://your-site.desk.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/cases',
      
    });
  }
}
