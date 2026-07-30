// @ts-nocheck
// Outbrain Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'campaigns',
    endpoint: '/marketers/{marketerId}/campaigns',
    schema: {
      name: 'campaigns',
      table: 'campaigns',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'createdOn', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('outbrain')
export class OutbrainConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'outbrain', 'outbrain', config, {
      baseUrl: config.host || 'https://api.outbrain.com/v1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/marketers',
      
    });
  }
}
