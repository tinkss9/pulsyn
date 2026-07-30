// @ts-nocheck
// Esri Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'features',
    endpoint: '/query',
    schema: {
      name: 'features',
      table: 'features',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'attributes', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('esri')
export class EsriConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'esri', 'esri', config, {
      baseUrl: config.host || 'https://your-server.com/server/rest/services',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/?f=json',
      
    });
  }
}
