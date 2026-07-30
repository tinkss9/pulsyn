// @ts-nocheck
// BitChute Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'videos',
    endpoint: '/videos',
    schema: {
      name: 'videos',
      table: 'videos',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('bitchute')
export class BitChuteConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bitchute', 'bitchute', config, {
      baseUrl: config.host || 'https://api.bitchute.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/videos',
      
    });
  }
}
