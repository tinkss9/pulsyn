// @ts-nocheck
// Ria Money Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'transfers',
    endpoint: '/transfers',
    schema: {
      name: 'transfers',
      table: 'transfers',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('ria-money')
export class RiaMoneyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ria-money', 'ria-money', config, {
      baseUrl: config.host || 'https://api.riafinancial.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/transfers',
      
    });
  }
}
