// Pixabay — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'images',
    endpoint: '/?key=demo&q=yellow+flowers&per_page=20',
    schema: {
      name: 'images',
      table: 'images',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'user', type: 'string', nullable: false, primaryKey: false },
        { name: 'tags', type: 'string', nullable: false, primaryKey: false },
        { name: 'webformatURL', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('pixabay')
export class PixabayConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pixabay', 'pixabay', config, {
      baseUrl: config.host || 'https://pixabay.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
