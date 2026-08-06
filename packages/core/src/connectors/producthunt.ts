// Product Hunt — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'posts', endpoint: '', schema: { name: 'posts', table: 'posts', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'tagline', type: 'string', nullable: false, primaryKey: false }, { name: 'votesCount', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('producthunt')
export class ProducthuntConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'producthunt', 'producthunt', config, {
      baseUrl: config.host || 'https://www.producthunt.com/frontend/graphql',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
