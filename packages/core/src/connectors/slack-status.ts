// Slack Status — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'status', endpoint: '/status.json', schema: { name: 'status', table: 'status', columns: [{ name: 'status', type: 'json', nullable: false, primaryKey: true }], primaryKey: ['status'] }, idField: 'status' }
];

@registerSource('slack-status')
export class SlackStatusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'slack-status', 'slack-status', config, {
      baseUrl: config.host || 'https://status.slack.com/api/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status.json',
    });
  }
}
