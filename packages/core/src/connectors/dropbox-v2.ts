// @ts-nocheck
// Dropbox v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'files',
    endpoint: '/files/list_folder',
    schema: {
      name: 'files',
      table: 'files',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'path_display', type: 'string', nullable: true },
      { name: 'server_modified', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'server_modified',
  },
];

@registerSource('dropbox-v2')
export class Dropboxv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dropbox-v2', 'dropbox-v2', config, {
      baseUrl: config.host || 'https://api.dropboxapi.com/2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users/get_current_account',
      
    });
  }
}
