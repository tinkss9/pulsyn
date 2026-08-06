// PlaceBear — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'images',
    endpoint: '/400/300',
    schema: {
      name: 'images',
      table: 'images',
      columns: [
        { name: 'url', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['url'],
    },
    idField: 'url',
  }
];

@registerSource('placebear')
export class PlacebearConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'placebear', 'placebear', config, {
      baseUrl: config.host || 'https://placebear.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/400/300',
    });
  }
}
