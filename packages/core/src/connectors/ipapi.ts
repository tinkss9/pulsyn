// IP API Connector — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'ip',
    endpoint: '/json',
    schema: {
      name: 'ip',
      table: 'ip',
      columns: [
        { name: 'ip', type: 'string', nullable: false, primaryKey: true },
        { name: 'city', type: 'string', nullable: true, primaryKey: false },
        { name: 'region', type: 'string', nullable: true, primaryKey: false },
        { name: 'country', type: 'string', nullable: true, primaryKey: false },
        { name: 'loc', type: 'string', nullable: true, primaryKey: false },
        { name: 'org', type: 'string', nullable: true, primaryKey: false },
        { name: 'timezone', type: 'string', nullable: true, primaryKey: false },
      ],
      primaryKey: ['ip'],
    },
    idField: 'ip',
  },
];

@registerSource('ipapi')
export class IPApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ipapi', 'ipapi', config, {
      baseUrl: config.host || 'https://ipapi.co',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/json',
    });
  }
}
