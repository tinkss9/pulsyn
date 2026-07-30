// @ts-nocheck
// Google Cloud IoT Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'registries',
    endpoint: '/projects/{projectId}/locations/{location}/registries',
    schema: {
      name: 'registries',
      table: 'registries',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('gcp-iot')
export class GoogleCloudIoTConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gcp-iot', 'gcp-iot', config, {
      baseUrl: config.host || 'https://cloudiot.googleapis.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/projects',
      
    });
  }
}
