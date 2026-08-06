// Amplitude API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'events', endpoint: '/events?limit=20', schema: { name: 'events', table: 'events', columns: [{ name: 'event', type: 'string', nullable: false, primaryKey: true }, { name: 'properties', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['event'] }, idField: 'event' }
];

@registerSource('amplitude-api')
export class AmplitudeApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'amplitude-api', 'amplitude-api', config, {
      baseUrl: config.host || 'https://amplitude.com/api/2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/events',
    });
  }
}
