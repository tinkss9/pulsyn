// @ts-nocheck
// Salesforce Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'accounts',
    endpoint: '/query?q=SELECT+Id,Name,Industry,Type,Phone,Website,CreatedDate,LastModifiedDate+FROM+Account',
    schema: { name: 'accounts', table: 'accounts', columns: [
      { name: 'Id', type: 'string', nullable: false, primaryKey: true },
      { name: 'Name', type: 'string', nullable: false },
      { name: 'Industry', type: 'string', nullable: true },
      { name: 'Type', type: 'string', nullable: true },
      { name: 'Phone', type: 'string', nullable: true },
      { name: 'Website', type: 'string', nullable: true },
      { name: 'CreatedDate', type: 'datetime', nullable: true },
      { name: 'LastModifiedDate', type: 'datetime', nullable: true },
    ], primaryKey: ['Id'] },
    idField: 'Id',
    modifiedField: 'LastModifiedDate',
  },
  {
    name: 'contacts',
    endpoint: '/query?q=SELECT+Id,FirstName,LastName,Email,Phone,AccountId,CreatedDate,LastModifiedDate+FROM+Contact',
    schema: { name: 'contacts', table: 'contacts', columns: [
      { name: 'Id', type: 'string', nullable: false, primaryKey: true },
      { name: 'FirstName', type: 'string', nullable: true },
      { name: 'LastName', type: 'string', nullable: false },
      { name: 'Email', type: 'string', nullable: true },
      { name: 'Phone', type: 'string', nullable: true },
      { name: 'AccountId', type: 'string', nullable: true },
      { name: 'CreatedDate', type: 'datetime', nullable: true },
      { name: 'LastModifiedDate', type: 'datetime', nullable: true },
    ], primaryKey: ['Id'] },
    idField: 'Id',
    modifiedField: 'LastModifiedDate',
  },
  {
    name: 'opportunities',
    endpoint: '/query?q=SELECT+Id,Name,StageName,Amount,CloseDate,AccountId,CreatedDate,LastModifiedDate+FROM+Opportunity',
    schema: { name: 'opportunities', table: 'opportunities', columns: [
      { name: 'Id', type: 'string', nullable: false, primaryKey: true },
      { name: 'Name', type: 'string', nullable: false },
      { name: 'StageName', type: 'string', nullable: false },
      { name: 'Amount', type: 'number', nullable: true },
      { name: 'CloseDate', type: 'date', nullable: false },
      { name: 'AccountId', type: 'string', nullable: true },
      { name: 'CreatedDate', type: 'datetime', nullable: true },
      { name: 'LastModifiedDate', type: 'datetime', nullable: true },
    ], primaryKey: ['Id'] },
    idField: 'Id',
    modifiedField: 'LastModifiedDate',
  },
];

@registerSource('salesforce')
export class SalesforceConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'salesforce', 'salesforce', config, {
      baseUrl: (config.host || 'https://login.salesforce.com') + '/services/data/v59.0',
      authType: 'oauth2_refresh',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/limits',
      rateLimit: { requests: 100, windowMs: 60000 },
    });
  }
}
