// Go Packages — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'versions', endpoint: '/github.com/gin-gonic/gin/@v/list', schema: { name: 'versions', table: 'versions', columns: [        { name: 'version', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['version'] }, idField: 'version' }];

@registerSource('go-pkg')
export class GoPkgConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'go-pkg', 'go-pkg', config, { baseUrl: config.host || 'https://proxy.golang.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/github.com/gin-gonic/gin/@v/list' });
  }
}
