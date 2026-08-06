// WakaTime Public — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'leaders',
    endpoint: '/leaders',
    schema: {
      name: 'leaders',
      table: 'leaders',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'user', type: 'json', nullable: false, primaryKey: false },
        { name: 'running_total', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('wakatime')
export class WakatimeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'wakatime', 'wakatime', config, {
      baseUrl: config.host || 'https://wakatime.com/api/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/leaders',
    });
  }
}
