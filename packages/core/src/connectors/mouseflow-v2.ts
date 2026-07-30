// @ts-nocheck
// Mouseflow v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'recordings',
    endpoint: '/websites/{websiteId}/recordings',
    schema: {
      name: 'recordings',
      table: 'recordings',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'duration', type: 'number', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('mouseflow-v2')
export class Mouseflowv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mouseflow-v2', 'mouseflow-v2', config, {
      baseUrl: config.host || 'https://api.mouseflow.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/websites',
      
    });
  }
}
