#!/usr/bin/env tsx
// Generate SaaS connector files from config
// Usage: npx tsx scripts/generate-saas-connectors.ts

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ConnectorConfig {
  engine: string;
  displayName: string;
  authType: 'bearer' | 'basic' | 'apikey';
  baseUrl: string;
  healthEndpoint: string;
  resources: {
    name: string;
    endpoint: string;
    idField: string;
    modifiedField?: string;
    columns: { name: string; type: string; nullable: boolean; primaryKey?: boolean }[];
  }[];
  paginationType: 'offset' | 'cursor' | 'link';
  rateLimit?: { requests: number; windowMs: number };
}

const configPath = join(__dirname, 'connectors-config.json');
const connectors: ConnectorConfig[] = JSON.parse(readFileSync(configPath, 'utf8'));
const outputDir = join(__dirname, '..', 'packages', 'core', 'src', 'connectors');

let generated = 0;

for (const conn of connectors) {
  const className = conn.displayName.replace(/[^a-zA-Z0-9]/g, '') + 'Connector';

  const resourcesStr = conn.resources.map(r => {
    const columnsStr = r.columns.map(c =>
      `      { name: '${c.name}', type: '${c.type}', nullable: ${c.nullable}${c.primaryKey ? ', primaryKey: true' : ''} }`
    ).join(',\n');

    return `  {
    name: '${r.name}',
    endpoint: '${r.endpoint}',
    schema: {
      name: '${r.name}',
      table: '${r.name}',
      columns: [
${columnsStr},
      ],
      primaryKey: ['${r.columns.find(c => c.primaryKey)?.name || r.idField}'],
    },
    idField: '${r.idField}',
    ${r.modifiedField ? `modifiedField: '${r.modifiedField}',` : ''}
  }`;
  }).join(',\n');

  const content = `// @ts-nocheck
// ${conn.displayName} Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
${resourcesStr},
];

@registerSource('${conn.engine}')
export class ${className} extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, '${conn.engine}', '${conn.engine}', config, {
      baseUrl: config.host || '${conn.baseUrl}',
      authType: '${conn.authType}',
      resources: RESOURCES,
      paginationType: '${conn.paginationType}',
      healthEndpoint: '${conn.healthEndpoint}',
      ${conn.rateLimit ? `rateLimit: { requests: ${conn.rateLimit.requests}, windowMs: ${conn.rateLimit.windowMs} },` : ''}
    });
  }
}
`;

  const filePath = join(outputDir, `${conn.engine}.ts`);
  writeFileSync(filePath, content);
  generated++;
}

console.log(`Generated ${generated} SaaS connectors`);
