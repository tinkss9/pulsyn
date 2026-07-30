// @ts-nocheck
// Discord Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'guilds',
    endpoint: '/users/@me/guilds',
    schema: {
      name: 'guilds',
      table: 'guilds',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'owner', type: 'boolean', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('discord')
export class DiscordConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'discord', 'discord', config, {
      baseUrl: config.host || 'https://discord.com/api/v10',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users/@me',
      
    });
  }
}
