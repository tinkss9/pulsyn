// @ts-nocheck
// Microsoft Teams Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'teams',
    endpoint: '/me/joinedTeams',
    schema: {
      name: 'teams',
      table: 'teams',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'displayName', type: 'string', nullable: false },
      { name: 'description', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
  {
    name: 'channels',
    endpoint: '/teams/{teamId}/channels',
    schema: {
      name: 'channels',
      table: 'channels',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'displayName', type: 'string', nullable: false },
      { name: 'description', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('microsoft-teams')
export class MicrosoftTeamsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'microsoft-teams', 'microsoft-teams', config, {
      baseUrl: config.host || 'https://graph.microsoft.com/v1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
