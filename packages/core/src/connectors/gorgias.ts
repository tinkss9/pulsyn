// @ts-nocheck
// Gorgias Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tickets',
    endpoint: '/tickets',
    schema: {
      name: 'tickets',
      table: 'tickets',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'subject', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_datetime', type: 'datetime', nullable: true },
      { name: 'updated_datetime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_datetime',
  },
];

@registerSource('gorgias')
export class GorgiasConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gorgias', 'gorgias', config, {
      baseUrl: config.host || 'https://your-domain.gorgias.com/api',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/account',
      
    });
  }
}
