// RemoteOK — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'jobs',
    endpoint: '',
    schema: {
      name: 'jobs',
      table: 'jobs',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'position', type: 'string', nullable: false, primaryKey: false },
        { name: 'company', type: 'string', nullable: false, primaryKey: false },
        { name: 'location', type: 'string', nullable: false, primaryKey: false },
        { name: 'salary', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('remoteok')
export class RemoteokConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'remoteok', 'remoteok', config, {
      baseUrl: config.host || 'https://remoteok.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
