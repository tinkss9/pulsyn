// @ts-nocheck
// Lever Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'opportunities',
    endpoint: '/opportunities',
    schema: {
      name: 'opportunities',
      table: 'opportunities',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'stage', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
];

@registerSource('lever')
export class LeverConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lever', 'lever', config, {
      baseUrl: config.host || 'https://api.lever.co/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
