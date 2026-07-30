// @ts-nocheck
// NGP VAN Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'people',
    endpoint: '/people',
    schema: {
      name: 'people',
      table: 'people',
      columns: [
      { name: 'vanId', type: 'number', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      ],
      primaryKey: ['vanId'],
    },
    idField: 'vanId',
    
  },
];

@registerSource('ngpvan')
export class NGPVANConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ngpvan', 'ngpvan', config, {
      baseUrl: config.host || 'https://api.securevan.com/v4',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/people',
      
    });
  }
}
