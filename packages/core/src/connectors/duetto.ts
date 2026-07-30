// @ts-nocheck
// Duetto Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'rates',
    endpoint: '/rates',
    schema: {
      name: 'rates',
      table: 'rates',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'rate', type: 'number', nullable: true },
      { name: 'date', type: 'date', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('duetto')
export class DuettoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'duetto', 'duetto', config, {
      baseUrl: config.host || 'https://api.duettoresearch.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/hotels',
      
    });
  }
}
