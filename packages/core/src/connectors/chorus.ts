// @ts-nocheck
// Chorus Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'calls',
    endpoint: '/calls',
    schema: {
      name: 'calls',
      table: 'calls',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'duration', type: 'number', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('chorus')
export class ChorusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'chorus', 'chorus', config, {
      baseUrl: config.host || 'https://api.chorus.ai/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/calls',
      
    });
  }
}
