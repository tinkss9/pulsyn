// @ts-nocheck
// Uber Freight Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'shipments',
    endpoint: '/freight/shipments',
    schema: {
      name: 'shipments',
      table: 'shipments',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('uber-freight')
export class UberFreightConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'uber-freight', 'uber-freight', config, {
      baseUrl: config.host || 'https://api.uber.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/freight/shipments',
      
    });
  }
}
