// @ts-nocheck
// PagerDuty Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'incidents',
    endpoint: '/incidents',
    schema: {
      name: 'incidents',
      table: 'incidents',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'urgency', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
];

@registerSource('pagerduty')
export class PagerDutyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pagerduty', 'pagerduty', config, {
      baseUrl: config.host || 'https://api.pagerduty.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/users/me',
      
    });
  }
}
