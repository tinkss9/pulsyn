// @ts-nocheck
// Salesforce Marketing Cloud Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'subscribers',
    endpoint: '/data/v1/customobjects/key:Subscribers/rowset',
    schema: {
      name: 'subscribers',
      table: 'subscribers',
      columns: [
      { name: 'SubscriberKey', type: 'string', nullable: false, primaryKey: true },
      { name: 'EmailAddress', type: 'string', nullable: true },
      { name: 'CreatedDate', type: 'datetime', nullable: true },
      ],
      primaryKey: ['SubscriberKey'],
    },
    idField: 'SubscriberKey',
    
  },
];

@registerSource('sfdc-marketing')
export class SalesforceMarketingCloudConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sfdc-marketing', 'sfdc-marketing', config, {
      baseUrl: config.host || 'https://your-subdomain.rest.marketingcloudapis.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/platform/v1/tokenContext',
      
    });
  }
}
