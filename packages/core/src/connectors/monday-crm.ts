// @ts-nocheck
// Monday CRM Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'boards',
    endpoint: '/boards',
    schema: {
      name: 'boards',
      table: 'boards',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('monday-crm')
export class MondayCRMConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'monday-crm', 'monday-crm', config, {
      baseUrl: config.host || 'https://api.monday.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/',
      
    });
  }
}
