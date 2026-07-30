// @ts-nocheck
// Zoho Desk Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tickets',
    endpoint: '/tickets',
    schema: {
      name: 'tickets',
      table: 'tickets',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'subject', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'createdTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('zoho-desk')
export class ZohoDeskConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zoho-desk', 'zoho-desk', config, {
      baseUrl: config.host || 'https://desk.zoho.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/tickets',
      
    });
  }
}
