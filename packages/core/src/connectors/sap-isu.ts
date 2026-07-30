// @ts-nocheck
// SAP ISU Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'customers',
    endpoint: '/customers',
    schema: {
      name: 'customers',
      table: 'customers',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sap-isu')
export class SAPISUConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sap-isu', 'sap-isu', config, {
      baseUrl: config.host || 'https://api.sap.com/isu/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/customers',
      
    });
  }
}
