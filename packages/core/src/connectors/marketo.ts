// @ts-nocheck
// Marketo Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'leads',
    endpoint: '/v1/leads.json',
    schema: {
      name: 'leads',
      table: 'leads',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      { name: 'updatedAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updatedAt',
  },
];

@registerSource('marketo')
export class MarketoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'marketo', 'marketo', config, {
      baseUrl: config.host || 'https://your-instance.mktorest.com/rest',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/v1/leads/describe.json',
      
    });
  }
}
