// Confluence API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'pages', endpoint: '/content?limit=20', schema: { name: 'pages', table: 'pages', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }, { name: 'type', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('confluence-api')
export class ConfluenceApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'confluence-api', 'confluence-api', config, {
      baseUrl: config.host || 'https://{domain}.atlassian.net/wiki/rest/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/content',
    });
  }
}
