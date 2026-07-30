// @ts-nocheck
// SAP Concur Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'expenses',
    endpoint: '/expense/expensereports',
    schema: {
      name: 'expenses',
      table: 'expenses',
      columns: [
      { name: 'ID', type: 'string', nullable: false, primaryKey: true },
      { name: 'Name', type: 'string', nullable: true },
      { name: 'Total', type: 'number', nullable: true },
      { name: 'Status', type: 'string', nullable: true },
      ],
      primaryKey: ['ID'],
    },
    idField: 'ID',
    
  },
];

@registerSource('concur')
export class SAPConcurConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'concur', 'concur', config, {
      baseUrl: config.host || 'https://api.concursolutions.com/api/v3.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/expense/expensereports',
      
    });
  }
}
