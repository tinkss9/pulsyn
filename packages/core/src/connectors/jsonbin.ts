// JSONBin — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'bins',
    endpoint: '/b/60f1a7c399803d1b08564b39/latest',
    schema: {
      name: 'bins',
      table: 'bins',
      columns: [
        { name: 'record', type: 'json', nullable: false, primaryKey: true }
      ],
      primaryKey: ['record'],
    },
    idField: 'record',
  }
];

@registerSource('jsonbin')
export class JsonbinConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jsonbin', 'jsonbin', config, {
      baseUrl: config.host || 'https://api.jsonbin.io/v3',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/b/60f1a7c399803d1b08564b39/latest',
    });
  }
}
