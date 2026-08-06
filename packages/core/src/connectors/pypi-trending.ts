// PyPI Trending — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'top', endpoint: '/top-pypi-packages-30-days.min.json', schema: { name: 'top', table: 'top', columns: [{ name: 'project', type: 'string', nullable: false, primaryKey: true }, { name: 'download_count', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['project'] }, idField: 'project' }
];

@registerSource('pypi-trending')
export class PypiTrendingConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pypi-trending', 'pypi-trending', config, {
      baseUrl: config.host || 'https://hugovk.github.io/top-pypi-packages',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/top-pypi-packages-30-days.min.json',
    });
  }
}
