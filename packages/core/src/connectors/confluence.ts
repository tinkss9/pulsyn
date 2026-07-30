// @ts-nocheck
// Confluence Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'pages',
    endpoint: '/pages',
    schema: {
      name: 'pages',
      table: 'pages',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'createdAt', type: 'datetime', nullable: true },
      { name: 'updatedAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updatedAt',
  },
];

@registerSource('confluence')
export class ConfluenceConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'confluence', 'confluence', config, {
      baseUrl: config.host || 'https://your-domain.atlassian.net/wiki/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/pages',
      
    });
  }
}
