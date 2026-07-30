// @ts-nocheck
// Capsule CRM Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'parties',
    endpoint: '/parties',
    schema: {
      name: 'parties',
      table: 'parties',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'type', type: 'string', nullable: false },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      { name: 'updatedAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updatedAt',
  },
  {
    name: 'opportunities',
    endpoint: '/opportunities',
    schema: {
      name: 'opportunities',
      table: 'opportunities',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'value', type: 'number', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updatedAt',
  },
];

@registerSource('capsule-crm')
export class CapsuleCRMConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'capsule-crm', 'capsule-crm', config, {
      baseUrl: config.host || 'https://api.capsulecrm.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users',
      
    });
  }
}
