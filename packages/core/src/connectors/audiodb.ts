// TheAudioDB — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'artists',
    endpoint: '/search.php?s=coldplay',
    schema: {
      name: 'artists',
      table: 'artists',
      columns: [
        { name: 'idArtist', type: 'string', nullable: false, primaryKey: true },
        { name: 'strArtist', type: 'string', nullable: false, primaryKey: false },
        { name: 'strGenre', type: 'string', nullable: false, primaryKey: false },
        { name: 'strCountry', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['idArtist'],
    },
    idField: 'idArtist',
  }
];

@registerSource('audiodb')
export class AudiodbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'audiodb', 'audiodb', config, {
      baseUrl: config.host || 'https://www.theaudiodb.com/api/v1/json/2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/search.php',
    });
  }
}
