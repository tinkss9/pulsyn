// @ts-nocheck
// Patreon Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'members',
    endpoint: '/members',
    schema: {
      name: 'members',
      table: 'members',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'full_name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('patreon')
export class PatreonConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'patreon', 'patreon', config, {
      baseUrl: config.host || 'https://www.patreon.com/api/oauth2/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/identity',
      
    });
  }
}
