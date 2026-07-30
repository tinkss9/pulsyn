// @ts-nocheck
// Google Pub/Sub Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'subscriptions',
    endpoint: '/projects/{projectId}/subscriptions',
    schema: {
      name: 'subscriptions',
      table: 'subscriptions',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'topic', type: 'string', nullable: true },
      { name: 'ackDeadlineSeconds', type: 'number', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('pubsub')
export class GooglePubSubConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pubsub', 'pubsub', config, {
      baseUrl: config.host || 'https://pubsub.googleapis.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/projects',
      
    });
  }
}
