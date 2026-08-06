// Random Number — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'numbers', endpoint: '/integers/?num=10&min=1&max=100&col=1&base=10&format=plain&rnd=new', schema: { name: 'numbers', table: 'numbers', columns: [        { name: 'number', type: 'number', nullable: false, primaryKey: true }], primaryKey: ['number'] }, idField: 'number' }];

@registerSource('random-num')
export class RandomNumConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'random-num', 'random-num', config, { baseUrl: config.host || 'https://www.random.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/integers/' });
  }
}
