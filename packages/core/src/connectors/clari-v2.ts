// @ts-nocheck
// Clari v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'forecast',
    endpoint: '/forecast',
    schema: {
      name: 'forecast',
      table: 'forecast',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'period', type: 'string', nullable: true },
      { name: 'amount', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('clari-v2')
export class Clariv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'clari-v2', 'clari-v2', config, {
      baseUrl: config.host || 'https://api.clari.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/forecast',
      
    });
  }
}
