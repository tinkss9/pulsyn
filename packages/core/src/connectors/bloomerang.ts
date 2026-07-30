// @ts-nocheck
// Bloomerang Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'constituents',
    endpoint: '/constituents',
    schema: {
      name: 'constituents',
      table: 'constituents',
      columns: [
      { name: 'Id', type: 'number', nullable: false, primaryKey: true },
      { name: 'FirstName', type: 'string', nullable: true },
      { name: 'LastName', type: 'string', nullable: true },
      { name: 'Email', type: 'string', nullable: true },
      ],
      primaryKey: ['Id'],
    },
    idField: 'Id',
    
  },
];

@registerSource('bloomerang')
export class BloomerangConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bloomerang', 'bloomerang', config, {
      baseUrl: config.host || 'https://api.bloomerang.co/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/constituents',
      
    });
  }
}
