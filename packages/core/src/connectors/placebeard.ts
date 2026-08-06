// PlaceBeard — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'images',
    endpoint: '/300x200',
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

@registerSource('placebeard')
export class PlacebeardConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'placebeard', 'placebeard', config, {
      baseUrl: config.host || 'https://placebeard.it',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/300x200',
    });
  }
}
