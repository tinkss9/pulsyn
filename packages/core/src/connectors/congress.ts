// ProPublica Congress — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'members',
    endpoint: '/118/senate/members.json',
    schema: {
      name: 'members',
      table: 'members',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'party', type: 'string', nullable: false, primaryKey: false },
        { name: 'state', type: 'string', nullable: false, primaryKey: false },
        { name: 'title', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('congress')
export class CongressConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'congress', 'congress', config, {
      baseUrl: config.host || 'https://api.propublica.org/congress/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/118/senate/members.json',
    });
  }
}
