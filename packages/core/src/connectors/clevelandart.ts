// Cleveland Museum of Art — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'artworks',
    endpoint: '/artworks/?limit=50',
    schema: {
      name: 'artworks',
      table: 'artworks',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'artist', type: 'json', nullable: false, primaryKey: false },
        { name: 'creation_date', type: 'string', nullable: false, primaryKey: false },
        { name: 'technique', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('clevelandart')
export class ClevelandartConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'clevelandart', 'clevelandart', config, {
      baseUrl: config.host || 'https://openaccess-api.clevelandart.org/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/artworks/',
    });
  }
}
