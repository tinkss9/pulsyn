// Last.fm API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'topartists',
    endpoint: '/?method=chart.gettopartists&api_key=demo&format=json&limit=20',
    schema: {
      name: 'topartists',
      table: 'topartists',
      columns: [
        { name: 'mbid', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'playcount', type: 'string', nullable: false, primaryKey: false },
        { name: 'listeners', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['mbid'],
    },
    idField: 'mbid',
  }
];

@registerSource('lastfm')
export class LastfmConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lastfm', 'lastfm', config, {
      baseUrl: config.host || 'https://ws.audioscrobbler.com/2.0',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
