// @ts-nocheck
// Redshift v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'clusters',
    endpoint: '/clusters',
    schema: {
      name: 'clusters',
      table: 'clusters',
      columns: [
      { name: 'ClusterIdentifier', type: 'string', nullable: false, primaryKey: true },
      { name: 'ClusterStatus', type: 'string', nullable: true },
      { name: 'NodeType', type: 'string', nullable: true },
      ],
      primaryKey: ['ClusterIdentifier'],
    },
    idField: 'ClusterIdentifier',
    
  },
];

@registerSource('redshift-v3')
export class Redshiftv3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'redshift-v3', 'redshift-v3', config, {
      baseUrl: config.host || 'https://redshift.us-east-1.amazonaws.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
      
    });
  }
}
