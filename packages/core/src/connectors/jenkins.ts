// @ts-nocheck
// Jenkins Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'jobs',
    endpoint: '/api/json?tree=jobs[name,url,color,lastBuild[number,result,timestamp]]',
    schema: {
      name: 'jobs',
      table: 'jobs',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'url', type: 'string', nullable: true },
      { name: 'color', type: 'string', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('jenkins')
export class JenkinsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jenkins', 'jenkins', config, {
      baseUrl: config.host || 'https://your-jenkins.com',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/json',
      
    });
  }
}
