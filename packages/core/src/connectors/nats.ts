// @ts-nocheck
// NATS Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'streams',
    endpoint: '/jsz',
    schema: {
      name: 'streams',
      table: 'streams',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'messages', type: 'number', nullable: true },
      { name: 'bytes', type: 'number', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('nats')
export class NATSConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nats', 'nats', config, {
      baseUrl: config.host || 'http://localhost:8222',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/varz',
      
    });
  }
}
