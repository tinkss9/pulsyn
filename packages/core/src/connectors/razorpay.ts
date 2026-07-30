// @ts-nocheck
// Razorpay Connector — Auto-generated from config
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
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('razorpay')
export class RazorpayConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'razorpay', 'razorpay', config, {
      baseUrl: config.host || 'https://api.razorpay.com/v1',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/payments',
      
    });
  }
}
