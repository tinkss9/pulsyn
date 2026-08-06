// Stoic Quotes — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'quotes',
    endpoint: '/quote',
    schema: {
      name: 'quotes',
      table: 'quotes',
      columns: [
        { name: 'text', type: 'string', nullable: false, primaryKey: true },
        { name: 'author', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['text'],
    },
    idField: 'text',
  }
];

@registerSource('stoic')
export class StoicConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'stoic', 'stoic', config, {
      baseUrl: config.host || 'https://stoic-quotes.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/quote',
    });
  }
}
