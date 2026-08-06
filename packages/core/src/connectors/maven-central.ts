// Maven Central — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'artifacts', endpoint: '?q=g:com.fasterxml.jackson.core&rows=20&wt=json', schema: { name: 'artifacts', table: 'artifacts', columns: [        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'g', type: 'string', nullable: false, primaryKey: false },
        { name: 'a', type: 'string', nullable: false, primaryKey: false },
        { name: 'latestVersion', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }];

@registerSource('maven-central')
export class MavenCentralConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'maven-central', 'maven-central', config, { baseUrl: config.host || 'https://search.maven.org/solrsearch/select', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '' });
  }
}
