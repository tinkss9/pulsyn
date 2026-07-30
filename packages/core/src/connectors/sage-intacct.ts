// @ts-nocheck
// Sage Intacct Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'invoices',
    endpoint: '/?q=readByQuery&object=ARINVOICE',
    schema: {
      name: 'invoices',
      table: 'invoices',
      columns: [
      { name: 'RECORDNO', type: 'string', nullable: false, primaryKey: true },
      { name: 'RECORDID', type: 'string', nullable: true },
      { name: 'TOTALDUE', type: 'number', nullable: true },
      ],
      primaryKey: ['RECORDNO'],
    },
    idField: 'RECORDNO',
    
  },
];

@registerSource('sage-intacct')
export class SageIntacctConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sage-intacct', 'sage-intacct', config, {
      baseUrl: config.host || 'https://api.intacct.com/ia/xml/xmlgw.phtml',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
      
    });
  }
}
