// @ts-nocheck
// Criteo Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'campaigns',
    endpoint: '/advertisers/{advertiserId}/campaigns',
    schema: {
      name: 'campaigns',
      table: 'campaigns',
      columns: [
      { name: 'campaignId', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['campaignId'],
    },
    idField: 'campaignId',
    
  },
];

@registerSource('criteo')
export class CriteoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'criteo', 'criteo', config, {
      baseUrl: config.host || 'https://api.criteo.com/2023-01',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/advertisers',
      
    });
  }
}
