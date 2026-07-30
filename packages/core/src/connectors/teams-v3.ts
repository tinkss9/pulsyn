// @ts-nocheck
// Microsoft Teams v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/teams/{teamId}/channels/{channelId}/messages',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'body', type: 'object', nullable: true },
      { name: 'createdDateTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('teams-v3')
export class MicrosoftTeamsv3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'teams-v3', 'teams-v3', config, {
      baseUrl: config.host || 'https://graph.microsoft.com/v1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
