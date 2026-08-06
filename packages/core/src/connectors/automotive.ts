// NHTSA Vehicles — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'makes',
    endpoint: '/vehicles/GetMakesForVehicleType/car?format=json',
    schema: {
      name: 'makes',
      table: 'makes',
      columns: [
        { name: 'MakeId', type: 'number', nullable: false, primaryKey: true },
        { name: 'MakeName', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['MakeId'],
    },
    idField: 'MakeId',
  },
  {
    name: 'models',
    endpoint: '/vehicles/GetModelsForMakeId/474?format=json',
    schema: {
      name: 'models',
      table: 'models',
      columns: [
        { name: 'Model_ID', type: 'number', nullable: false, primaryKey: true },
        { name: 'Make_Name', type: 'string', nullable: false, primaryKey: false },
        { name: 'Model_Name', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['Model_ID'],
    },
    idField: 'Model_ID',
  }
];

@registerSource('automotive')
export class AutomotiveConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'automotive', 'automotive', config, {
      baseUrl: config.host || 'https://vpic.nhtsa.dot.gov/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/vehicles/GetMakesForVehicleType/car',
    });
  }
}
