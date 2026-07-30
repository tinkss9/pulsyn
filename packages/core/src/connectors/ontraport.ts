// @ts-nocheck
// Ontraport Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/objects/contact',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'firstname', type: 'string', nullable: true },
      { name: 'lastname', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'date_created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('ontraport')
export class OntraportConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ontraport', 'ontraport', config, {
      baseUrl: config.host || 'https://api.ontraport.com/1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/objects',
      
    });
  }
}
