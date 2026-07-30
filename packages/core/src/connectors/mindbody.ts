// @ts-nocheck
// Mindbody Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'clients',
    endpoint: '/clients',
    schema: {
      name: 'clients',
      table: 'clients',
      columns: [
      { name: 'Id', type: 'string', nullable: false, primaryKey: true },
      { name: 'FirstName', type: 'string', nullable: true },
      { name: 'LastName', type: 'string', nullable: true },
      { name: 'Email', type: 'string', nullable: true },
      ],
      primaryKey: ['Id'],
    },
    idField: 'Id',
    
  },
];

@registerSource('mindbody')
export class MindbodyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mindbody', 'mindbody', config, {
      baseUrl: config.host || 'https://api.mindbodyonline.com/public/v6',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/clients',
      
    });
  }
}
