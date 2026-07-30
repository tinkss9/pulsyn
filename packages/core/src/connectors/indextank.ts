// @ts-nocheck
// IndexTank Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'indexes',
    endpoint: '/indexes',
    schema: {
      name: 'indexes',
      table: 'indexes',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('indextank')
export class IndexTankConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'indextank', 'indextank', config, {
      baseUrl: config.host || 'https://api.indextank.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/indexes',
      
    });
  }
}
