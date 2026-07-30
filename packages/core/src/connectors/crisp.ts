// @ts-nocheck
// Crisp Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'conversations',
    endpoint: '/website/{website_id}/conversations',
    schema: {
      name: 'conversations',
      table: 'conversations',
      columns: [
      { name: 'session_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'state', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['session_id'],
    },
    idField: 'session_id',
    
  },
];

@registerSource('crisp')
export class CrispConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'crisp', 'crisp', config, {
      baseUrl: config.host || 'https://api.crisp.chat/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/website/{website_id}',
      
    });
  }
}
