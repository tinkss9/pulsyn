// Yu-Gi-Oh API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'cards',
    endpoint: '/cardinfo.php?num=50&offset=0',
    schema: {
      name: 'cards',
      table: 'cards',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'type', type: 'string', nullable: false, primaryKey: false },
        { name: 'race', type: 'string', nullable: false, primaryKey: false },
        { name: 'atk', type: 'number', nullable: false, primaryKey: false },
        { name: 'def', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('keycloak')
export class KeycloakConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'keycloak', 'keycloak', config, {
      baseUrl: config.host || 'https://db.ygoprodeck.com/api/v7',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/cardinfo.php',
    });
  }
}
