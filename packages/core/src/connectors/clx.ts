// @ts-nocheck
// CLX Connector — Auto-generated from config
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

@registerSource('clx')
export class CLXConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'clx', 'clx', config, {
      baseUrl: config.host || 'https://api.clx.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/messages',
      
    });
  }
}
