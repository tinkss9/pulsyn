// Lever API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'postings', endpoint: '/postings?limit=20', schema: { name: 'postings', table: 'postings', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'text', type: 'string', nullable: false, primaryKey: false }, { name: 'state', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('lever-api')
export class LeverApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lever-api', 'lever-api', config, {
      baseUrl: config.host || 'https://api.lever.co/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/postings',
    });
  }
}
