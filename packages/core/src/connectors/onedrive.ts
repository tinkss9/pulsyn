// @ts-nocheck
// OneDrive Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'files',
    endpoint: '/me/drive/root/children',
    schema: {
      name: 'files',
      table: 'files',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'size', type: 'number', nullable: true },
      { name: 'createdDateTime', type: 'datetime', nullable: true },
      { name: 'lastModifiedDateTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'lastModifiedDateTime',
  },
];

@registerSource('onedrive')
export class OneDriveConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'onedrive', 'onedrive', config, {
      baseUrl: config.host || 'https://graph.microsoft.com/v1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me/drive',
      
    });
  }
}
