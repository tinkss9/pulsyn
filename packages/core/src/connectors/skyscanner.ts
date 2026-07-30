// @ts-nocheck
// Skyscanner Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'flights',
    endpoint: '/flights/live/search/create',
    schema: {
      name: 'flights',
      table: 'flights',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'price', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('skyscanner')
export class SkyscannerConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'skyscanner', 'skyscanner', config, {
      baseUrl: config.host || 'https://partners.api.skyscanner.net/apiservices/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/flights/live/search/create',
      
    });
  }
}
