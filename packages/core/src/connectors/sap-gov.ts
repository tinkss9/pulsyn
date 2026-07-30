// @ts-nocheck
// SAP Gov Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'services',
    endpoint: '/services',
    schema: {
      name: 'services',
      table: 'services',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sap-gov')
export class SAPGovConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sap-gov', 'sap-gov', config, {
      baseUrl: config.host || 'https://api.sap.com/gov/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/services',
      
    });
  }
}
