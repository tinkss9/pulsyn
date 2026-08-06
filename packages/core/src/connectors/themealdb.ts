// TheMealDB — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'categories',
    endpoint: '/categories.php',
    schema: {
      name: 'categories',
      table: 'categories',
      columns: [
        { name: 'idCategory', type: 'string', nullable: false, primaryKey: true },
        { name: 'strCategory', type: 'string', nullable: false, primaryKey: false },
        { name: 'strCategoryDescription', type: 'string', nullable: false, primaryKey: false },
        { name: 'strCategoryThumb', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['idCategory'],
    },
    idField: 'idCategory',
  },
  {
    name: 'areas',
    endpoint: '/list.php?a=list',
    schema: {
      name: 'areas',
      table: 'areas',
      columns: [
        { name: 'strArea', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['strArea'],
    },
    idField: 'strArea',
  }
];

@registerSource('themealdb')
export class ThemealdbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'themealdb', 'themealdb', config, {
      baseUrl: config.host || 'https://www.themealdb.com/api/json/v1/1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/categories.php',
    });
  }
}
