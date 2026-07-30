// @ts-nocheck
// ActiveCampaign Connector — Auto-generated from config
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
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'cdate', type: 'datetime', nullable: true },
      { name: 'udate', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'udate',
  },
  {
    name: 'deals',
    endpoint: '/deals',
    schema: {
      name: 'deals',
      table: 'deals',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'value', type: 'number', nullable: true },
      { name: 'stage', type: 'string', nullable: true },
      { name: 'cdate', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('activecampaign')
export class ActiveCampaignConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'activecampaign', 'activecampaign', config, {
      baseUrl: config.host || 'https://your-account.api-us1.com/api/3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/users/me',
      
    });
  }
}
