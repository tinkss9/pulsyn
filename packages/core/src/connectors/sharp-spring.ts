// @ts-nocheck
// SharpSpring Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'leads',
    endpoint: '/?method=getLeads',
    schema: {
      name: 'leads',
      table: 'leads',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'emailAddress', type: 'string', nullable: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sharp-spring')
export class SharpSpringConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sharp-spring', 'sharp-spring', config, {
      baseUrl: config.host || 'https://api.sharpspring.com/pubapi/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/?method=getAccountInfo',
      
    });
  }
}
