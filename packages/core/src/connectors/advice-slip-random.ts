// Advice Slip Random — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'advice', endpoint: '/advice', schema: { name: 'advice', table: 'advice', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'advice', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('advice-slip-random')
export class AdviceSlipRandomConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'advice-slip-random', 'advice-slip-random', config, {
      baseUrl: config.host || 'https://api.adviceslip.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/advice',
    });
  }
}
