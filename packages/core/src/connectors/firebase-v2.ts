// @ts-nocheck
// Firebase v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'collections',
    endpoint: '/projects/{projectId}/databases/(default)/documents',
    schema: {
      name: 'collections',
      table: 'collections',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'fields', type: 'object', nullable: true },
      { name: 'createTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('firebase-v2')
export class Firebasev2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'firebase-v2', 'firebase-v2', config, {
      baseUrl: config.host || 'https://firestore.googleapis.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/projects',
      
    });
  }
}
