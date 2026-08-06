// Lorem Ipsum — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'text',
    endpoint: '/1/plaintext',
    schema: {
      name: 'text',
      table: 'text',
      columns: [
        { name: 'text', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['text'],
    },
    idField: 'text',
  }
];

@registerSource('lorem')
export class LoremConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lorem', 'lorem', config, {
      baseUrl: config.host || 'https://loripsum.net/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/1/plaintext',
    });
  }
}
