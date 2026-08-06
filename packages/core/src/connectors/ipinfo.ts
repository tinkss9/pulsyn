// IPInfo — Community API (No Auth)
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
        { name: 'city', type: 'string', nullable: false, primaryKey: false },
        { name: 'region', type: 'string', nullable: false, primaryKey: false },
        { name: 'country', type: 'string', nullable: false, primaryKey: false },
        { name: 'loc', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['ip'],
    },
    idField: 'ip',
  }
];

@registerSource('ipinfo')
export class IpinfoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ipinfo', 'ipinfo', config, {
      baseUrl: config.host || 'https://ipinfo.io',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/json',
    });
  }
}
