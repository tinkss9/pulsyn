// @ts-nocheck
// Ghost Newsletter Connector — Auto-generated from config
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
      { name: 'email', type: 'string', nullable: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('ghost-newsletter')
export class GhostNewsletterConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ghost-newsletter', 'ghost-newsletter', config, {
      baseUrl: config.host || 'https://your-site.ghost.io/ghost/api/admin',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/site',
      
    });
  }
}
