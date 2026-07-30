// @ts-nocheck
// Terraform Cloud Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'workspaces',
    endpoint: '/workspaces',
    schema: {
      name: 'workspaces',
      table: 'workspaces',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'environment', type: 'string', nullable: true },
      { name: 'created-at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('terraform-cloud')
export class TerraformCloudConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'terraform-cloud', 'terraform-cloud', config, {
      baseUrl: config.host || 'https://app.terraform.io/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/organizations',
      
    });
  }
}
