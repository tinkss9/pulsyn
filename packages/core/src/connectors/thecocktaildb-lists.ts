// TheCocktailDB Lists — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'categories', endpoint: '/list.php?c=list', schema: { name: 'categories', table: 'categories', columns: [{ name: 'strCategory', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['strCategory'] }, idField: 'strCategory' },
{ name: 'glasses', endpoint: '/list.php?g=list', schema: { name: 'glasses', table: 'glasses', columns: [{ name: 'strGlass', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['strGlass'] }, idField: 'strGlass' }
];

@registerSource('thecocktaildb-lists')
export class ThecocktaildbListsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'thecocktaildb-lists', 'thecocktaildb-lists', config, {
      baseUrl: config.host || 'https://www.thecocktaildb.com/api/json/v1/1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/list.php',
    });
  }
}
