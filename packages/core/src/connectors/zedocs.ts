// @ts-nocheck
// ZeDocs Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'documents',
    endpoint: '/documents',
    schema: {
      name: 'documents',
      table: 'documents',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('zedocs')
export class ZeDocsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zedocs', 'zedocs', config, {
      baseUrl: config.host || 'https://api.zedocs.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/documents',
      
    });
  }
}
