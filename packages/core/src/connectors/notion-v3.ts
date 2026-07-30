// @ts-nocheck
// Notion v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'databases',
    endpoint: '/search',
    schema: {
      name: 'databases',
      table: 'databases',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'created_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('notion-v3')
export class Notionv3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'notion-v3', 'notion-v3', config, {
      baseUrl: config.host || 'https://api.notion.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/search',
      
    });
  }
}
