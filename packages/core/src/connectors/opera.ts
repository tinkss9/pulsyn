// @ts-nocheck
// Opera PMS Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'reservations',
    endpoint: '/reservations',
    schema: {
      name: 'reservations',
      table: 'reservations',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('opera')
export class OperaPMSConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'opera', 'opera', config, {
      baseUrl: config.host || 'https://api.opera.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/reservations',
      
    });
  }
}
