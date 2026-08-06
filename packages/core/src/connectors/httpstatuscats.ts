// HTTP Status Cats — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'statuses',
    endpoint: '/200',
    schema: {
      name: 'statuses',
      table: 'statuses',
      columns: [
        { name: 'status', type: 'number', nullable: false, primaryKey: true },
        { name: 'image_url', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['status'],
    },
    idField: 'status',
  }
];

@registerSource('httpstatuscats')
export class HttpstatuscatsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'httpstatuscats', 'httpstatuscats', config, {
      baseUrl: config.host || 'https://http.cat',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/200',
    });
  }
}
