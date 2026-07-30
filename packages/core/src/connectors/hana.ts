// @ts-nocheck
// SAP HANA Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tables',
    endpoint: '/tables',
    schema: {
      name: 'tables',
      table: 'tables',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('hana')
export class SAPHANAConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'hana', 'hana', config, {
      baseUrl: config.host || 'https://your-hana.com/sap/hana',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
      
    });
  }
}
