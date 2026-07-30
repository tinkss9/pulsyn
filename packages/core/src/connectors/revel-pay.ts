// @ts-nocheck
// Revel Pay Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'payments',
    endpoint: '/payments',
    schema: {
      name: 'payments',
      table: 'payments',
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

@registerSource('revel-pay')
export class RevelPayConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'revel-pay', 'revel-pay', config, {
      baseUrl: config.host || 'https://api.revelsystems.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/payments',
      
    });
  }
}
