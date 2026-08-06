// CircleCI API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'pipelines', endpoint: '/project/{slug}/pipeline?limit=20', schema: { name: 'pipelines', table: 'pipelines', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'state', type: 'string', nullable: false, primaryKey: false }, { name: 'created_at', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('circleci-api')
export class CircleciApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'circleci-api', 'circleci-api', config, {
      baseUrl: config.host || 'https://circleci.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/project/{slug}/pipeline',
    });
  }
}
