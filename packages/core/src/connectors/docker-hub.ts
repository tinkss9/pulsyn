// @ts-nocheck
// Docker Hub Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'repositories',
    endpoint: '/repositories/{namespace}',
    schema: {
      name: 'repositories',
      table: 'repositories',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'description', type: 'string', nullable: true },
      { name: 'last_updated', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'last_updated',
  },
];

@registerSource('docker-hub')
export class DockerHubConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'docker-hub', 'docker-hub', config, {
      baseUrl: config.host || 'https://hub.docker.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/user',
      
    });
  }
}
