// @ts-nocheck
// Adobe Creative Cloud Connector — Auto-generated from config
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
      { name: 'name', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('adobe-creative')
export class AdobeCreativeCloudConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'adobe-creative', 'adobe-creative', config, {
      baseUrl: config.host || 'https://cc-api-storage.adobe.io',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/files',
      
    });
  }
}
