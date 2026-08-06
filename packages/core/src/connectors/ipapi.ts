// IP API — Community API (No Auth)
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
        { name: 'country_name', type: 'string', nullable: false, primaryKey: false },
        { name: 'latitude', type: 'number', nullable: false, primaryKey: false },
        { name: 'longitude', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['ip'],
    },
    idField: 'ip',
  }
];

@registerSource('ipapi')
export class IpapiConnector extends SaaSConnector {
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
