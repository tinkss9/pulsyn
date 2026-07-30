// @ts-nocheck
// Figma v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'files',
    endpoint: '/files/{fileKey}',
    schema: {
      name: 'files',
      table: 'files',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'lastModified', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'lastModified',
  },
];

@registerSource('figma-v2')
export class Figmav2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'figma-v2', 'figma-v2', config, {
      baseUrl: config.host || 'https://api.figma.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
