// EPA Air Quality — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'observation',
    endpoint: '/observation/zipCode/current?format=application/json&zipCode=10001&distance=25&API_KEY=DEMO_KEY',
    schema: {
      name: 'observation',
      table: 'observation',
      columns: [
        { name: 'DateObserved', type: 'string', nullable: false, primaryKey: true },
        { name: 'HourObserved', type: 'number', nullable: false, primaryKey: false },
        { name: 'ReportingArea', type: 'string', nullable: false, primaryKey: false },
        { name: 'AQI', type: 'number', nullable: false, primaryKey: false },
        { name: 'Category', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['DateObserved'],
    },
    idField: 'DateObserved',
  }
];

@registerSource('edealer')
export class EdealerConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'edealer', 'edealer', config, {
      baseUrl: config.host || 'https://www.airnowapi.org/aq',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/observation/zipCode/current',
    });
  }
}
