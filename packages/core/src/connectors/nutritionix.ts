// Nutritionix — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'nutrients',
    endpoint: '/natural/nutrients?query=apple',
    schema: {
      name: 'nutrients',
      table: 'nutrients',
      columns: [
        { name: 'food_name', type: 'string', nullable: false, primaryKey: true },
        { name: 'nf_calories', type: 'number', nullable: false, primaryKey: false },
        { name: 'nf_protein', type: 'number', nullable: false, primaryKey: false },
        { name: 'nf_total_carbohydrate', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['food_name'],
    },
    idField: 'food_name',
  }
];

@registerSource('nutritionix')
export class NutritionixConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nutritionix', 'nutritionix', config, {
      baseUrl: config.host || 'https://trackapi.nutritionix.com/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/natural/nutrients',
    });
  }
}
