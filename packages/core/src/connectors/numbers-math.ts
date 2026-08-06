// Numbers Math — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'math', endpoint: '/42/math?json', schema: { name: 'math', table: 'math', columns: [        { name: 'text', type: 'string', nullable: false, primaryKey: true },
        { name: 'number', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['text'] }, idField: 'text' }];

@registerSource('numbers-math')
export class NumbersMathConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'numbers-math', 'numbers-math', config, { baseUrl: config.host || 'http://numbersapi.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/42/math' });
  }
}
