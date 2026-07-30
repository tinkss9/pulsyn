// @ts-nocheck
// Mews Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'reservations',
    endpoint: '/reservations/getAll',
    schema: {
      name: 'reservations',
      table: 'reservations',
      columns: [
      { name: 'Id', type: 'string', nullable: false, primaryKey: true },
      { name: 'State', type: 'string', nullable: true },
      { name: 'CreatedUtc', type: 'datetime', nullable: true },
      ],
      primaryKey: ['Id'],
    },
    idField: 'Id',
    
  },
];

@registerSource('mews')
export class MewsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mews', 'mews', config, {
      baseUrl: config.host || 'https://api.mews-demo.com/api/connector/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/reservations/getAll',
      
    });
  }
}
