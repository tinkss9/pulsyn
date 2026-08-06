// Affirmations — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'affirmations',
    endpoint: '/',
    schema: {
      name: 'affirmations',
      table: 'affirmations',
      columns: [
        { name: 'affirmation', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['affirmation'],
    },
    idField: 'affirmation',
  }
];

@registerSource('affirmations')
export class AffirmationsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'affirmations', 'affirmations', config, {
      baseUrl: config.host || 'https://www.affirmations.dev',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
