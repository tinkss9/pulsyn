// @ts-nocheck
// DynamoDB v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tables',
    endpoint: '/',
    schema: {
      name: 'tables',
      table: 'tables',
      columns: [
      { name: 'TableName', type: 'string', nullable: false, primaryKey: true },
      { name: 'TableStatus', type: 'string', nullable: true },
      { name: 'ItemCount', type: 'number', nullable: true },
      ],
      primaryKey: ['TableName'],
    },
    idField: 'TableName',
    
  },
];

@registerSource('dynamodb-v2')
export class DynamoDBv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dynamodb-v2', 'dynamodb-v2', config, {
      baseUrl: config.host || 'https://dynamodb.us-east-1.amazonaws.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/',
      
    });
  }
}
