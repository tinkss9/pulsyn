// @ts-nocheck
// KAYAK Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'flights',
    endpoint: '/flights',
    schema: {
      name: 'flights',
      table: 'flights',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'price', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('kayak')
export class KAYAKConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'kayak', 'kayak', config, {
      baseUrl: config.host || 'https://api.kayak.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/flights',
      
    });
  }
}
