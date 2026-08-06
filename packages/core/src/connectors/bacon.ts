// Bacon Ipsum — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'meat',
    endpoint: '/?type=all-meat&paras=2',
    schema: {
      name: 'meat',
      table: 'meat',
      columns: [
        { name: 'text', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['text'],
    },
    idField: 'text',
  }
];

@registerSource('bacon')
export class BaconConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bacon', 'bacon', config, {
      baseUrl: config.host || 'https://baconipsum.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
