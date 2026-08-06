// Numbers Trivia — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'trivia', endpoint: '/42/trivia?json', schema: { name: 'trivia', table: 'trivia', columns: [        { name: 'text', type: 'string', nullable: false, primaryKey: true },
        { name: 'number', type: 'number', nullable: false, primaryKey: false },
        { name: 'found', type: 'boolean', nullable: false, primaryKey: false }], primaryKey: ['text'] }, idField: 'text' }];

@registerSource('numbers-trivia')
export class NumbersTriviaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'numbers-trivia', 'numbers-trivia', config, { baseUrl: config.host || 'http://numbersapi.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/42/trivia' });
  }
}
