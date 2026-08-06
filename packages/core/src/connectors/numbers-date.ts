// Numbers Date — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'date', endpoint: '/1/1/date?json', schema: { name: 'date', table: 'date', columns: [        { name: 'text', type: 'string', nullable: false, primaryKey: true },
        { name: 'year', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['text'] }, idField: 'text' }];

@registerSource('numbers-date')
export class NumbersDateConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'numbers-date', 'numbers-date', config, { baseUrl: config.host || 'http://numbersapi.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/1/1/date' });
  }
}
