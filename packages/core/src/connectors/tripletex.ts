// @ts-nocheck
// Tripletex Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'invoices',
    endpoint: '/invoice',
    schema: {
      name: 'invoices',
      table: 'invoices',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'invoiceNumber', type: 'string', nullable: true },
      { name: 'amount', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('tripletex')
export class TripletexConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tripletex', 'tripletex', config, {
      baseUrl: config.host || 'https://api.tripletex.no/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/token/session',
      
    });
  }
}
