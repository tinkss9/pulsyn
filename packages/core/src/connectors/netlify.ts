// @ts-nocheck
// Netlify Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'sites',
    endpoint: '/sites',
    schema: {
      name: 'sites',
      table: 'sites',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'url', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
];

@registerSource('netlify')
export class NetlifyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'netlify', 'netlify', config, {
      baseUrl: config.host || 'https://api.netlify.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/user',
      
    });
  }
}
