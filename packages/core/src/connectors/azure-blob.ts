// @ts-nocheck
// Azure Blob Storage Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'containers',
    endpoint: '/?comp=list',
    schema: {
      name: 'containers',
      table: 'containers',
      columns: [
      { name: 'Name', type: 'string', nullable: false, primaryKey: true },
      { name: 'LastModified', type: 'datetime', nullable: true },
      ],
      primaryKey: ['Name'],
    },
    idField: 'Name',
    
  },
];

@registerSource('azure-blob')
export class AzureBlobStorageConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'azure-blob', 'azure-blob', config, {
      baseUrl: config.host || 'https://your-account.blob.core.windows.net',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/?comp=list',
      
    });
  }
}
