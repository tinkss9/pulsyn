// @ts-nocheck
// Balena Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'devices',
    endpoint: '/device',
    schema: {
      name: 'devices',
      table: 'devices',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'device_name', type: 'string', nullable: true },
      { name: 'is_online', type: 'boolean', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('balena')
export class BalenaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'balena', 'balena', config, {
      baseUrl: config.host || 'https://api.balena-cloud.com/v6',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
