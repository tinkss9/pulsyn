// @ts-nocheck
// SAP Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'systems',
    endpoint: '/systems',
    schema: {
      name: 'systems',
      table: 'systems',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sap')
export class SAPConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sap', 'sap', config, {
      baseUrl: config.host || 'https://api.sap.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/systems',
      
    });
  }
}
