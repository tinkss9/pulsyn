// Calvin and Hobbes — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'comics',
    endpoint: '?action=query&list=categorymembers&cmtitle=Category:Strips&cmlimit=50&format=json',
    schema: {
      name: 'comics',
      table: 'comics',
      columns: [
        { name: 'pageid', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['pageid'],
    },
    idField: 'pageid',
  }
];

@registerSource('calvinandhobbes')
export class CalvinandhobbesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'calvinandhobbes', 'calvinandhobbes', config, {
      baseUrl: config.host || 'https://calvinandhobbes.fandom.com/api.php',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
