// @ts-nocheck
// Odysee Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'claims',
    endpoint: '/proxy',
    schema: {
      name: 'claims',
      table: 'claims',
      columns: [
      { name: 'claim_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      ],
      primaryKey: ['claim_id'],
    },
    idField: 'claim_id',
    
  },
];

@registerSource('odysee')
export class OdyseeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'odysee', 'odysee', config, {
      baseUrl: config.host || 'https://api.odysee.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/proxy',
      
    });
  }
}
