// @ts-nocheck
// Thruway Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'shipments',
    endpoint: '/shipdays',
    schema: {
      name: 'shipments',
      table: 'shipments',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('thruway')
export class ThruwayConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'thruway', 'thruway', config, {
      baseUrl: config.host || 'https://api.thruway.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/shipments',
      
    });
  }
}
