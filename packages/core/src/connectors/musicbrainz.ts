// MusicBrainz — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'artists',
    endpoint: '/artist/?query=radiohead&fmt=json&limit=20',
    schema: {
      name: 'artists',
      table: 'artists',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'type', type: 'string', nullable: false, primaryKey: false },
        { name: 'country', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('musicbrainz')
export class MusicbrainzConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'musicbrainz', 'musicbrainz', config, {
      baseUrl: config.host || 'https://musicbrainz.org/ws/2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/artist/',
    });
  }
}
