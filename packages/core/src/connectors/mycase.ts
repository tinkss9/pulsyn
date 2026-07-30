// @ts-nocheck
// MyCase Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'cases',
    endpoint: '/cases',
    schema: {
      name: 'cases',
      table: 'cases',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('mycase')
export class MyCaseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mycase', 'mycase', config, {
      baseUrl: config.host || 'https://api.mycase.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/cases',
      
    });
  }
}
