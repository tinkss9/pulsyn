// @ts-nocheck
// Campaign Monitor Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'subscribers',
    endpoint: '/lists/{listId}/active.json',
    schema: {
      name: 'subscribers',
      table: 'subscribers',
      columns: [
      { name: 'EmailAddress', type: 'string', nullable: false, primaryKey: true },
      { name: 'Name', type: 'string', nullable: true },
      { name: 'Date', type: 'datetime', nullable: true },
      ],
      primaryKey: ['EmailAddress'],
    },
    idField: 'EmailAddress',
    
  },
];

@registerSource('campaign-monitor')
export class CampaignMonitorConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'campaign-monitor', 'campaign-monitor', config, {
      baseUrl: config.host || 'https://api.createsend.com/api/v3.3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/clients.json',
      
    });
  }
}
