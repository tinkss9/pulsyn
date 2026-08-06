// Steven Se Gallery — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'images',
    endpoint: '/200/300',
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

@registerSource('stevensegallery')
export class StevensegalleryConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'stevensegallery', 'stevensegallery', config, {
      baseUrl: config.host || 'https://stevensegallery.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/200/300',
    });
  }
}
