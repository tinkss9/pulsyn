// Simpsons Quotes — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'quotes',
    endpoint: '/quotes?count=50',
    schema: {
      name: 'quotes',
      table: 'quotes',
      columns: [
        { name: 'quote', type: 'string', nullable: false, primaryKey: true },
        { name: 'character', type: 'string', nullable: false, primaryKey: false },
        { name: 'image', type: 'string', nullable: false, primaryKey: false },
        { name: 'characterDirection', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['quote'],
    },
    idField: 'quote',
  }
];

@registerSource('simpsons')
export class SimpsonsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'simpsons', 'simpsons', config, {
      baseUrl: config.host || 'https://thesimpsonsquoteapi.glitch.me',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/quotes',
    });
  }
}
