// Rijksmuseum — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'artworks',
    endpoint: '/collection?key=0fiuZFh4&ps=50',
    schema: {
      name: 'artworks',
      table: 'artworks',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'principalOrFirstMaker', type: 'string', nullable: false, primaryKey: false },
        { name: 'longTitle', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('rijksmuseum')
export class RijksmuseumConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'rijksmuseum', 'rijksmuseum', config, {
      baseUrl: config.host || 'https://www.rijksmuseum.nl/api/en',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/collection',
    });
  }
}
