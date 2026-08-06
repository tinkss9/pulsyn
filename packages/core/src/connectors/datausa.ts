// Data USA — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'population',
    endpoint: '/data?Geography=04000US06&drilldowns=Nation&measures=Population',
    schema: {
      name: 'population',
      table: 'population',
      columns: [
        { name: 'ID_Nation', type: 'string', nullable: false, primaryKey: true },
        { name: 'Nation', type: 'string', nullable: false, primaryKey: false },
        { name: 'Population', type: 'number', nullable: false, primaryKey: false },
        { name: 'Year', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['ID_Nation'],
    },
    idField: 'ID_Nation',
  }
];

@registerSource('datausa')
export class DatausaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'datausa', 'datausa', config, {
      baseUrl: config.host || 'https://datausa.io/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/data',
    });
  }
}
