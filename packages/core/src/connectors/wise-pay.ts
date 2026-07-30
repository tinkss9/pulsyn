// @ts-nocheck
// Wise Pay Connector — Auto-generated from config
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
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('wise-pay')
export class WisePayConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'wise-pay', 'wise-pay', config, {
      baseUrl: config.host || 'https://api.wise.com/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/profiles',
      
    });
  }
}
