// SharePoint API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'lists', endpoint: '/web/lists', schema: { name: 'lists', table: 'lists', columns: [{ name: 'Id', type: 'string', nullable: false, primaryKey: true }, { name: 'Title', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['Id'] }, idField: 'Id' }
];

@registerSource('sharepoint-api')
export class SharepointApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sharepoint-api', 'sharepoint-api', config, {
      baseUrl: config.host || 'https://{tenant}.sharepoint.com/_api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/web/lists',
    });
  }
}
