// @ts-nocheck
// VTiger Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/query?query=SELECT * FROM Contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'firstname', type: 'string', nullable: true },
      { name: 'lastname', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('v-tiger')
export class VTigerConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'v-tiger', 'v-tiger', config, {
      baseUrl: config.host || 'https://your-instance.od2.vtiger.com/restapi/v1/vtiger/default',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/me',
      
    });
  }
}
