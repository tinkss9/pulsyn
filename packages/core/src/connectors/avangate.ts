// @ts-nocheck
// Avangate Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'orders',
    endpoint: '/orders',
    schema: {
      name: 'orders',
      table: 'orders',
      columns: [
      { name: 'RefNo', type: 'string', nullable: false, primaryKey: true },
      { name: 'Amount', type: 'number', nullable: true },
      { name: 'Status', type: 'string', nullable: true },
      ],
      primaryKey: ['RefNo'],
    },
    idField: 'RefNo',
    
  },
];

@registerSource('avangate')
export class AvangateConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'avangate', 'avangate', config, {
      baseUrl: config.host || 'https://api.avangate.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/orders',
      
    });
  }
}
