// @ts-nocheck
// Galileo Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'accounts',
    endpoint: '/accounts',
    schema: {
      name: 'accounts',
      table: 'accounts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'balance', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('galileo')
export class GalileoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'galileo', 'galileo', config, {
      baseUrl: config.host || 'https://api.galileo.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/accounts',
      
    });
  }
}
