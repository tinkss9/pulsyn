// Connector registry — auto-discovery and factory for source/target connectors
// Ported from DMS Replicate src/replication/registry.py

import { BaseConnector } from './base';
import { SaaSConnector } from './saas-base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent } from '../events';

type ConnectorConstructor = new (...args: any[]) => BaseConnector;

const sources: Map<string, ConnectorConstructor> = new Map();
const targets: Map<string, ConnectorConstructor> = new Map();

export function registerSource(name: string) {
  return function (constructor: any) {
    sources.set(name, constructor);
    return constructor;
  };
}

export function registerTarget(name: string) {
  return function (constructor: any) {
    targets.set(name, constructor);
    return constructor;
  };
}

function createConnector(cls: ConnectorConstructor, id: string, name: string, config: DatabaseConfig): BaseConnector {
  // SaaS connectors have constructor(id, config) — check by prototype chain
  if (cls.prototype instanceof SaaSConnector) {
    return new cls(id, config);
  }
  // Base connectors have constructor(id, name, engine, config)
  return new cls(id, name, name, config);
}

export class ConnectorRegistry {
  static getSource(name: string, id: string, config: DatabaseConfig, options?: any): BaseConnector {
    const cls = sources.get(name);
    if (!cls) {
      throw new Error(`Unknown source connector: ${name}. Available: ${sources.keys()}`);
    }
    return createConnector(cls, id, name, config);
  }

  static getTarget(name: string, id: string, config: DatabaseConfig, options?: any): BaseConnector {
    const cls = targets.get(name);
    if (!cls) {
      throw new Error(`Unknown target connector: ${name}. Available: ${targets.keys()}`);
    }
    return createConnector(cls, id, name, config);
  }

  static listSources(): string[] {
    return Array.from(sources.keys());
  }

  static listTargets(): string[] {
    return Array.from(targets.keys());
  }

  static listAll(): { sources: string[]; targets: string[] } {
    return {
      sources: Array.from(sources.keys()),
      targets: Array.from(targets.keys()),
    };
  }

  static has(name: string): boolean {
    return sources.has(name) || targets.has(name);
  }
}
