// @ts-nocheck
// Expensify Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'expenses',
    endpoint: '/expenses',
    schema: {
      name: 'expenses',
      table: 'expenses',
      columns: [
      { name: 'transactionID', type: 'string', nullable: false, primaryKey: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['transactionID'],
    },
    idField: 'transactionID',
    
  },
];

@registerSource('expensify')
export class ExpensifyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'expensify', 'expensify', config, {
      baseUrl: config.host || 'https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/expenses',
      
    });
  }
}
