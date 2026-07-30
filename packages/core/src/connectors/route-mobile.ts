// @ts-nocheck
// Route Mobile Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/messages',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'from', type: 'string', nullable: true },
      { name: 'to', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('route-mobile')
export class RouteMobileConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'route-mobile', 'route-mobile', config, {
      baseUrl: config.host || 'https://api.routemobile.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/messages',
      
    });
  }
}
