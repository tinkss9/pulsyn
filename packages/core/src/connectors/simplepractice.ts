// @ts-nocheck
// SimplePractice Connector — Auto-generated from config
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
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('simplepractice')
export class SimplePracticeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'simplepractice', 'simplepractice', config, {
      baseUrl: config.host || 'https://api.simplepractice.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/clients',
      
    });
  }
}
