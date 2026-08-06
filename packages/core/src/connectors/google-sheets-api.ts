// Google Sheets API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'sheets', endpoint: '/spreadsheets/{id}', schema: { name: 'sheets', table: 'sheets', columns: [{ name: 'spreadsheetId', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['spreadsheetId'] }, idField: 'spreadsheetId' }
];

@registerSource('google-sheets-api')
export class GoogleSheetsApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'google-sheets-api', 'google-sheets-api', config, {
      baseUrl: config.host || 'https://sheets.googleapis.com/v4',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/spreadsheets/{id}',
    });
  }
}
