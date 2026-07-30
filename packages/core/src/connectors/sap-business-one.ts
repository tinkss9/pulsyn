// @ts-nocheck
// SAP Business One Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'businessPartners',
    endpoint: '/BusinessPartners',
    schema: {
      name: 'businessPartners',
      table: 'businessPartners',
      columns: [
      { name: 'CardCode', type: 'string', nullable: false, primaryKey: true },
      { name: 'CardName', type: 'string', nullable: false },
      ],
      primaryKey: ['CardCode'],
    },
    idField: 'CardCode',
    
  },
];

@registerSource('sap-business-one')
export class SAPBusinessOneConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sap-business-one', 'sap-business-one', config, {
      baseUrl: config.host || 'https://your-server:50000/b1s/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/BusinessPartners',
      
    });
  }
}
