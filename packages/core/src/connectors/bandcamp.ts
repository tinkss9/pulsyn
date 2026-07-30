// @ts-nocheck
// Bandcamp Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'albums',
    endpoint: '/fan/albums',
    schema: {
      name: 'albums',
      table: 'albums',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('bandcamp')
export class BandcampConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bandcamp', 'bandcamp', config, {
      baseUrl: config.host || 'https://api.bandcamp.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/fan',
      
    });
  }
}
