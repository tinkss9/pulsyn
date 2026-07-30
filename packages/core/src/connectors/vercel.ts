// @ts-nocheck
// Vercel Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'projects',
    endpoint: '/v9/projects',
    schema: {
      name: 'projects',
      table: 'projects',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'framework', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('vercel')
export class VercelConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'vercel', 'vercel', config, {
      baseUrl: config.host || 'https://api.vercel.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/v2/user',
      
    });
  }
}
