// @ts-nocheck
// Google Hotels Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'hotels',
    endpoint: '/hotels',
    schema: {
      name: 'hotels',
      table: 'hotels',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('google-hotels')
export class GoogleHotelsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'google-hotels', 'google-hotels', config, {
      baseUrl: config.host || 'https://www.googleapis.com/travel/hotels/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/hotels',
      
    });
  }
}
