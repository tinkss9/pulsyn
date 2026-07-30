// @ts-nocheck
// Azure Synapse Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'pipelines',
    endpoint: '/pipelines',
    schema: {
      name: 'pipelines',
      table: 'pipelines',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('synapse')
export class AzureSynapseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'synapse', 'synapse', config, {
      baseUrl: config.host || 'https://your-workspace.dev.azuresynapse.net',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/pipelines',
      
    });
  }
}
