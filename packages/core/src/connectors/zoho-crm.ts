// @ts-nocheck
// Zoho CRM Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'leads',
    endpoint: '/Leads',
    schema: {
      name: 'leads',
      table: 'leads',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'Full_Name', type: 'string', nullable: false },
      { name: 'Email', type: 'string', nullable: true },
      { name: 'Company', type: 'string', nullable: true },
      { name: 'Created_Time', type: 'datetime', nullable: true },
      { name: 'Modified_Time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'Modified_Time',
  },
  {
    name: 'contacts',
    endpoint: '/Contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'Full_Name', type: 'string', nullable: false },
      { name: 'Email', type: 'string', nullable: true },
      { name: 'Created_Time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'Modified_Time',
  },
  {
    name: 'deals',
    endpoint: '/Deals',
    schema: {
      name: 'deals',
      table: 'deals',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'Deal_Name', type: 'string', nullable: false },
      { name: 'Amount', type: 'number', nullable: true },
      { name: 'Stage', type: 'string', nullable: true },
      { name: 'Closing_Date', type: 'date', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'Modified_Time',
  },
];

@registerSource('zoho-crm')
export class ZohoCRMConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zoho-crm', 'zoho-crm', config, {
      baseUrl: config.host || 'https://www.zohoapis.com/crm/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/org',
      
    });
  }
}
