// PlaceCorgi — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'images',
    endpoint: '/300/200',
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

@registerSource('placecorgi')
export class PlacecorgiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'placecorgi', 'placecorgi', config, {
      baseUrl: config.host || 'https://placecorgi.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/300/200',
    });
  }
}
