// @ts-nocheck
// Freightview Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'shipments',
    endpoint: '/shipments',
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

@registerSource('freightview')
export class FreightviewConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'freightview', 'freightview', config, {
      baseUrl: config.host || 'https://api.freightview.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/shipments',
      
    });
  }
}
