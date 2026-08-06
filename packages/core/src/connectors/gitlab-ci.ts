// GitLab CI — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'pipelines', endpoint: '/projects/{id}/pipelines?per_page=20', schema: { name: 'pipelines', table: 'pipelines', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'status', type: 'string', nullable: false, primaryKey: false }, { name: 'ref', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('gitlab-ci')
export class GitlabCiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gitlab-ci', 'gitlab-ci', config, {
      baseUrl: config.host || 'https://gitlab.com/api/v4',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/projects/{id}/pipelines',
    });
  }
}
