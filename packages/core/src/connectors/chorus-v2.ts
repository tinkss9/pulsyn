// @ts-nocheck
// Chorus v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'meetings',
    endpoint: '/meetings',
    schema: {
      name: 'meetings',
      table: 'meetings',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('chorus-v2')
export class Chorusv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'chorus-v2', 'chorus-v2', config, {
      baseUrl: config.host || 'https://api.chorus.ai/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/meetings',
      
    });
  }
}
