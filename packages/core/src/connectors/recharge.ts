// @ts-nocheck
// Recharge Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'subscriptions',
    endpoint: '/subscriptions',
    schema: {
      name: 'subscriptions',
      table: 'subscriptions',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('recharge')
export class RechargeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'recharge', 'recharge', config, {
      baseUrl: config.host || 'https://api.rechargepayments.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/subscriptions',
      
    });
  }
}
