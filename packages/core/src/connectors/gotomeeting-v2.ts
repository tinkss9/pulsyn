// @ts-nocheck
// GoToMeeting v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'meetings',
    endpoint: '/meetings',
    schema: {
      name: 'meetings',
      table: 'meetings',
      columns: [
      { name: 'meetingid', type: 'string', nullable: false, primaryKey: true },
      { name: 'subject', type: 'string', nullable: true },
      { name: 'starttime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['meetingid'],
    },
    idField: 'meetingid',
    
  },
];

@registerSource('gotomeeting-v2')
export class GoToMeetingv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gotomeeting-v2', 'gotomeeting-v2', config, {
      baseUrl: config.host || 'https://api.getgo.com/G2M/rest',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/meetings',
      
    });
  }
}
