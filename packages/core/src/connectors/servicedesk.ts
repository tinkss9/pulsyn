// @ts-nocheck
// ServiceDesk Plus Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'requests',
    endpoint: '/requests',
    schema: {
      name: 'requests',
      table: 'requests',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'subject', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('servicedesk')
export class ServiceDeskPlusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'servicedesk', 'servicedesk', config, {
      baseUrl: config.host || 'https://your-servicedesk.com/api/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/requests',
      
    });
  }
}
