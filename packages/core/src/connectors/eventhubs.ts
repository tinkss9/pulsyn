// @ts-nocheck
// Azure Event Hubs Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'hubs',
    endpoint: '/$management',
    schema: {
      name: 'hubs',
      table: 'hubs',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('eventhubs')
export class AzureEventHubsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'eventhubs', 'eventhubs', config, {
      baseUrl: config.host || 'https://your-namespace.servicebus.windows.net',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/$management',
      
    });
  }
}
