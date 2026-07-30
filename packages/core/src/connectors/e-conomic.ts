// @ts-nocheck
// e-conomic Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'invoices',
    endpoint: '/invoices/booked',
    schema: {
      name: 'invoices',
      table: 'invoices',
      columns: [
      { name: 'invoiceNumber', type: 'number', nullable: false, primaryKey: true },
      { name: 'netAmount', type: 'number', nullable: true },
      { name: 'date', type: 'date', nullable: true },
      ],
      primaryKey: ['invoiceNumber'],
    },
    idField: 'invoiceNumber',
    
  },
];

@registerSource('e-conomic')
export class economicConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'e-conomic', 'e-conomic', config, {
      baseUrl: config.host || 'https://restapi.e-conomic.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/customers',
      
    });
  }
}
