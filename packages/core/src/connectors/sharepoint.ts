// @ts-nocheck
// SharePoint Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'lists',
    endpoint: '/sites/{siteId}/lists',
    schema: {
      name: 'lists',
      table: 'lists',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'createdDateTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sharepoint')
export class SharePointConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sharepoint', 'sharepoint', config, {
      baseUrl: config.host || 'https://your-tenant.sharepoint.com/_api/v2.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
