// @ts-nocheck
// Google Meet v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'meetings',
    endpoint: '/spaces',
    schema: {
      name: 'meetings',
      table: 'meetings',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'meetingUri', type: 'string', nullable: true },
      { name: 'createTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('google-meet-v2')
export class GoogleMeetv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'google-meet-v2', 'google-meet-v2', config, {
      baseUrl: config.host || 'https://meet.googleapis.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/spaces',
      
    });
  }
}
