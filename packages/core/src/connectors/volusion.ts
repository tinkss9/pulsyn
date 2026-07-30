// @ts-nocheck
// Volusion Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'products',
    endpoint: '/Products',
    schema: {
      name: 'products',
      table: 'products',
      columns: [
      { name: 'ProductID', type: 'number', nullable: false, primaryKey: true },
      { name: 'ProductName', type: 'string', nullable: false },
      { name: 'Price', type: 'number', nullable: true },
      ],
      primaryKey: ['ProductID'],
    },
    idField: 'ProductID',
    
  },
];

@registerSource('volusion')
export class VolusionConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'volusion', 'volusion', config, {
      baseUrl: config.host || 'https://your-store.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/Products',
      
    });
  }
}
