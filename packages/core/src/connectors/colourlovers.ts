// COLOURlovers — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'colors', endpoint: '/colors/top?format=json&numResults=20', schema: { name: 'colors', table: 'colors', columns: [        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'hex', type: 'string', nullable: false, primaryKey: false },
        { name: 'rgb', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }];

@registerSource('colourlovers')
export class ColourloversConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'colourlovers', 'colourlovers', config, { baseUrl: config.host || 'https://www.colourlovers.com/api', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/colors/top' });
  }
}
