// @ts-nocheck
// Mixpanel Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'events', endpoint: '/api/2.0/events', schema: { name: 'events', table: 'events', columns: [
    { name: 'event', type: 'string', nullable: false, primaryKey: true }, { name: 'count', type: 'number', nullable: true },
  ], primaryKey: ['event'] }, idField: 'event' },
  { name: 'funnels', endpoint: '/api/2.0/funnels', schema: { name: 'funnels', table: 'funnels', columns: [
    { name: 'funnel_id', type: 'number', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'created', type: 'datetime', nullable: true },
  ], primaryKey: ['funnel_id'] }, idField: 'funnel_id' },
];

@registerSource('mixpanel')
export class MixpanelConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mixpanel', 'mixpanel', config, {
      baseUrl: config.host || 'https://mixpanel.com',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/2.0/events',
    });
  }
}
