// @ts-nocheck
// Slate Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'applications',
    endpoint: '/applications',
    schema: {
      name: 'applications',
      table: 'applications',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('slate')
export class SlateConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'slate', 'slate', config, {
      baseUrl: config.host || 'https://api.slate.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/applications',
      
    });
  }
}
