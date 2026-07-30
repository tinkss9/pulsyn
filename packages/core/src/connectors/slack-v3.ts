// @ts-nocheck
// Slack v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/conversations.history',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'ts', type: 'string', nullable: false, primaryKey: true },
      { name: 'text', type: 'string', nullable: true },
      { name: 'user', type: 'string', nullable: true },
      ],
      primaryKey: ['ts'],
    },
    idField: 'ts',
    
  },
];

@registerSource('slack-v3')
export class Slackv3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'slack-v3', 'slack-v3', config, {
      baseUrl: config.host || 'https://slack.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/auth.test',
      
    });
  }
}
