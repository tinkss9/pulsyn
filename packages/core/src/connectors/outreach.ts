// @ts-nocheck
// Outreach Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'prospects',
    endpoint: '/prospects',
    schema: {
      name: 'prospects',
      table: 'prospects',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      { name: 'updatedAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updatedAt',
  },
];

@registerSource('outreach')
export class OutreachConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'outreach', 'outreach', config, {
      baseUrl: config.host || 'https://api.outreach.io/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users',
      
    });
  }
}
