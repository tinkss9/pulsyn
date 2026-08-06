// Solar System Bodies — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'bodies', endpoint: '/bodies?data=id,name,englishName,bodyType,gravity,mass', schema: { name: 'bodies', table: 'bodies', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'englishName', type: 'string', nullable: false, primaryKey: false }, { name: 'bodyType', type: 'string', nullable: false, primaryKey: false }, { name: 'gravity', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('solarsystem-bodies')
export class SolarsystemBodiesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'solarsystem-bodies', 'solarsystem-bodies', config, {
      baseUrl: config.host || 'https://api.le-systeme-solaire.net/rest',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/bodies',
    });
  }
}
