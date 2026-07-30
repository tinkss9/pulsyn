// @ts-nocheck
// SevDesk Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'invoices',
    endpoint: '/Invoice',
    schema: {
      name: 'invoices',
      table: 'invoices',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'invoiceNumber', type: 'string', nullable: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sevdesk')
export class SevDeskConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sevdesk', 'sevdesk', config, {
      baseUrl: config.host || 'https://my.sevdesk.de/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/Contact',
      
    });
  }
}
