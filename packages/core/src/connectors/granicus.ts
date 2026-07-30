// @ts-nocheck
// Granicus Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'meetings',
    endpoint: '/meetings',
    schema: {
      name: 'meetings',
      table: 'meetings',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'date', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('granicus')
export class GranicusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'granicus', 'granicus', config, {
      baseUrl: config.host || 'https://api.granicus.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/meetings',
      
    });
  }
}
