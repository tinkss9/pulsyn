// ICanHazDadJoke v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'jokes', endpoint: '/', schema: { name: 'jokes', table: 'jokes', columns: [        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'joke', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }];

@registerSource('icanhazdadjoke2')
export class Icanhazdadjoke2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'icanhazdadjoke2', 'icanhazdadjoke2', config, { baseUrl: config.host || 'https://icanhazdadjoke.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/' });
  }
}
