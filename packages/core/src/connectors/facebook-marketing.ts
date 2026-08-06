// Facebook Marketing — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'campaigns', endpoint: '/act_{id}/campaigns?limit=20', schema: { name: 'campaigns', table: 'campaigns', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('facebook-marketing')
export class FacebookMarketingConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'facebook-marketing', 'facebook-marketing', config, {
      baseUrl: config.host || 'https://graph.facebook.com/v19.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/act_{id}/campaigns',
    });
  }
}
