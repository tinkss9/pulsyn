// @ts-nocheck
// Bandwidth v2 Connector — Auto-generated from config
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
      { name: 'time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('bandwidth-v2')
export class Bandwidthv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bandwidth-v2', 'bandwidth-v2', config, {
      baseUrl: config.host || 'https://messaging.bandwidth.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/messages',
      
    });
  }
}
