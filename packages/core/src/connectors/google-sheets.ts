// @ts-nocheck
// Google Sheets Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'spreadsheets',
    endpoint: '/spreadsheets',
    schema: {
      name: 'spreadsheets',
      table: 'spreadsheets',
      columns: [
      { name: 'spreadsheetId', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      ],
      primaryKey: ['spreadsheetId'],
    },
    idField: 'spreadsheetId',
    
  },
];

@registerSource('google-sheets')
export class GoogleSheetsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'google-sheets', 'google-sheets', config, {
      baseUrl: config.host || 'https://sheets.googleapis.com/v4',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/spreadsheets',
      
    });
  }
}
