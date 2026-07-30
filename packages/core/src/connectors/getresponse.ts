// @ts-nocheck
// GetResponse Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'contactId', type: 'string', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'createdOn', type: 'datetime', nullable: true },
      ],
      primaryKey: ['contactId'],
    },
    idField: 'contactId',
    
  },
];

@registerSource('getresponse')
export class GetResponseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'getresponse', 'getresponse', config, {
      baseUrl: config.host || 'https://api.getresponse.com/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/campaigns',
      
    });
  }
}
