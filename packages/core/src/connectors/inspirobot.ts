// InspiroBot — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'quotes',
    endpoint: '?generate=true',
    schema: {
      name: 'quotes',
      table: 'quotes',
      columns: [
        { name: 'data', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['data'],
    },
    idField: 'data',
  }
];

@registerSource('inspirobot')
export class InspirobotConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'inspirobot', 'inspirobot', config, {
      baseUrl: config.host || 'https://inspirobot.me/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
