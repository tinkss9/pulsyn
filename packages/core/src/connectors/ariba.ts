// @ts-nocheck
// SAP Ariba Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'suppliers',
    endpoint: '/suppliers',
    schema: {
      name: 'suppliers',
      table: 'suppliers',
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

@registerSource('ariba')
export class SAPAribaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ariba', 'ariba', config, {
      baseUrl: config.host || 'https://api.ariba.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/suppliers',
      
    });
  }
}
