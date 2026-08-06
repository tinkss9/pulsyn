// Dog API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'breeds',
    endpoint: '/breeds',
    schema: {
      name: 'breeds',
      table: 'breeds',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'type', type: 'string', nullable: false, primaryKey: false },
        { name: 'attributes', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('dogapi')
export class DogapiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dogapi', 'dogapi', config, {
      baseUrl: config.host || 'https://dogapi.dog/api/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/breeds',
    });
  }
}
