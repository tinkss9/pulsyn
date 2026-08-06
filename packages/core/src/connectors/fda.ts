// FDA API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'drugs',
    endpoint: '/drug/event.json?limit=50',
    schema: {
      name: 'drugs',
      table: 'drugs',
      columns: [
        { name: 'safetyreportid', type: 'string', nullable: false, primaryKey: true },
        { name: 'receiver', type: 'json', nullable: false, primaryKey: false },
        { name: 'patient', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['safetyreportid'],
    },
    idField: 'safetyreportid',
  }
];

@registerSource('fda')
export class FdaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'fda', 'fda', config, {
      baseUrl: config.host || 'https://api.fda.gov',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/drug/event.json',
    });
  }
}
