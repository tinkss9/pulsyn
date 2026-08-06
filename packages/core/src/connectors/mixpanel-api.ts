// Mixpanel API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'events', endpoint: '/events?event=["Page View"]&limit=20', schema: { name: 'events', table: 'events', columns: [{ name: 'event', type: 'string', nullable: false, primaryKey: true }, { name: 'properties', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['event'] }, idField: 'event' }
];

@registerSource('mixpanel-api')
export class MixpanelApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mixpanel-api', 'mixpanel-api', config, {
      baseUrl: config.host || 'https://mixpanel.com/api/2.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/events',
    });
  }
}
