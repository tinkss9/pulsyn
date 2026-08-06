// FizzBuzz API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'fizzbuzz',
    endpoint: '/fizzbuzz?limit=20',
    schema: {
      name: 'fizzbuzz',
      table: 'fizzbuzz',
      columns: [
        { name: 'number', type: 'number', nullable: false, primaryKey: true },
        { name: 'result', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['number'],
    },
    idField: 'number',
  }
];

@registerSource('fizzbuzz')
export class FizzbuzzConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'fizzbuzz', 'fizzbuzz', config, {
      baseUrl: config.host || 'https://fizzbuzz-api.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/fizzbuzz',
    });
  }
}
