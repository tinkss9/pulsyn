// Dropbox API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'files', endpoint: '/files/list_folder', schema: { name: 'files', table: 'files', columns: [{ name: 'name', type: 'string', nullable: false, primaryKey: true }, { name: 'path_display', type: 'string', nullable: false, primaryKey: false }, { name: 'size', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['name'] }, idField: 'name' }
];

@registerSource('dropbox-api')
export class DropboxApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dropbox-api', 'dropbox-api', config, {
      baseUrl: config.host || 'https://api.dropboxapi.com/2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/files/list_folder',
    });
  }
}
