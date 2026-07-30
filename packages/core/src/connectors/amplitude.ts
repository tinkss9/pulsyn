// @ts-nocheck
// Amplitude Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'events', endpoint: '/2/events/segmentation', schema: { name: 'events', table: 'events', columns: [
    { name: 'event', type: 'string', nullable: false, primaryKey: true }, { name: 'count', type: 'number', nullable: true },
    { name: 'date', type: 'date', nullable: true },
  ], primaryKey: ['event'] }, idField: 'event' },
  { name: 'users', endpoint: '/2/usersearch', schema: { name: 'users', table: 'users', columns: [
    { name: 'user_id', type: 'string', nullable: false, primaryKey: true }, { name: 'first_seen', type: 'datetime', nullable: true },
    { name: 'last_seen', type: 'datetime', nullable: true }, { name: 'num_events', type: 'number', nullable: true },
  ], primaryKey: ['user_id'] }, idField: 'user_id' },
];

@registerSource('amplitude')
export class AmplitudeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'amplitude', 'amplitude', config, {
      baseUrl: config.host || 'https://amplitude.com/api',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/2/usersearch',
    });
  }
}
