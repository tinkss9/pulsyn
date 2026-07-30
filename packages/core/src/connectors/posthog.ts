// @ts-nocheck
// PostHog Connector — Auto-generated from config
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
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'event', type: 'string', nullable: false },
      { name: 'timestamp', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
  {
    name: 'persons',
    endpoint: '/persons',
    schema: {
      name: 'persons',
      table: 'persons',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('posthog')
export class PostHogConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'posthog', 'posthog', config, {
      baseUrl: config.host || 'https://app.posthog.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/projects',
      
    });
  }
}
