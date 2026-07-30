// @ts-nocheck
// Coda Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'docs',
    endpoint: '/docs',
    schema: {
      name: 'docs',
      table: 'docs',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('coda')
export class CodaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'coda', 'coda', config, {
      baseUrl: config.host || 'https://coda.io/apis/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/whoami',
      
    });
  }
}
