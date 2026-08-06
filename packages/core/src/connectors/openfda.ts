// OpenFDA — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'drugs',
    endpoint: '/drug/event.json?limit=20',
    schema: {
      name: 'drugs',
      table: 'drugs',
      columns: [
        { name: 'safetyreportid', type: 'string', nullable: false, primaryKey: true },
        { name: 'serious', type: 'string', nullable: false, primaryKey: false },
        { name: 'receiver', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['safetyreportid'],
    },
    idField: 'safetyreportid',
  },
  {
    name: 'foods',
    endpoint: '/food/enforcement.json?limit=20',
    schema: {
      name: 'foods',
      table: 'foods',
      columns: [
        { name: 'recall_number', type: 'string', nullable: false, primaryKey: true },
        { name: 'product_description', type: 'string', nullable: false, primaryKey: false },
        { name: 'reason_for_recall', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['recall_number'],
    },
    idField: 'recall_number',
  }
];

@registerSource('openfda')
export class OpenfdaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'openfda', 'openfda', config, {
      baseUrl: config.host || 'https://api.fda.gov',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/drug/event.json',
    });
  }
}
