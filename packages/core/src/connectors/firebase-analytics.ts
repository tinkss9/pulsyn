// @ts-nocheck
// Firebase Analytics Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'events',
    endpoint: '/events',
    schema: {
      name: 'events',
      table: 'events',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'count', type: 'number', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('firebase-analytics')
export class FirebaseAnalyticsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'firebase-analytics', 'firebase-analytics', config, {
      baseUrl: config.host || 'https://firebase.google.com/docs/analytics',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/events',
      
    });
  }
}
