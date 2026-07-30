// @ts-nocheck
// Dynamics 365 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'accounts',
    endpoint: '/accounts',
    schema: {
      name: 'accounts',
      table: 'accounts',
      columns: [
      { name: 'accountid', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'createdon', type: 'datetime', nullable: true },
      { name: 'modifiedon', type: 'datetime', nullable: true },
      ],
      primaryKey: ['accountid'],
    },
    idField: 'accountid',
    modifiedField: 'modifiedon',
  },
];

@registerSource('dynamics-365')
export class Dynamics365Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dynamics-365', 'dynamics-365', config, {
      baseUrl: config.host || 'https://your-org.crm.dynamics.com/api/data/v9.2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/accounts',
      
    });
  }
}
