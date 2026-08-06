// Maven Search — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'artifacts', endpoint: '?q=g:org.springframework&rows=20&wt=json', schema: { name: 'artifacts', table: 'artifacts', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'g', type: 'string', nullable: false, primaryKey: false }, { name: 'a', type: 'string', nullable: false, primaryKey: false }, { name: 'latestVersion', type: 'string', nullable: false, primaryKey: false }, { name: 'timestamp', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('maven-search')
export class MavenSearchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'maven-search', 'maven-search', config, {
      baseUrl: config.host || 'https://search.maven.org/solrsearch/select',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
