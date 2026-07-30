// @ts-nocheck
// Bill.com Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'invoices',
    endpoint: '/List/Invoice.json',
    schema: {
      name: 'invoices',
      table: 'invoices',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'invoiceNumber', type: 'string', nullable: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'dueDate', type: 'date', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('bill-com')
export class BillcomConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bill-com', 'bill-com', config, {
      baseUrl: config.host || 'https://api.bill.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'start',
      healthEndpoint: '/List/Invoice.json',
      
    });
  }
}
