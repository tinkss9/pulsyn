// @ts-nocheck
// Ubidots Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'devices',
    endpoint: '/datasources',
    schema: {
      name: 'devices',
      table: 'devices',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'label', type: 'string', nullable: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('ubidots')
export class UbidotsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ubidots', 'ubidots', config, {
      baseUrl: config.host || 'https://industrial.api.ubidots.com/api/v1.6',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/datasources',
      
    });
  }
}
