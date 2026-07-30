// @ts-nocheck
// Google Drive v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'files',
    endpoint: '/files',
    schema: {
      name: 'files',
      table: 'files',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'mimeType', type: 'string', nullable: true },
      { name: 'createdTime', type: 'datetime', nullable: true },
      { name: 'modifiedTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'modifiedTime',
  },
];

@registerSource('google-drive-v2')
export class GoogleDrivev2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'google-drive-v2', 'google-drive-v2', config, {
      baseUrl: config.host || 'https://www.googleapis.com/drive/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/about',
      
    });
  }
}
