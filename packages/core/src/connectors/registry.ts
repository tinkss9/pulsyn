// Connector registry — auto-discovery and factory for source/target connectors
// Ported from DMS Replicate src/replication/registry.py

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema } from '../types';
import { UnifiedChangeEvent } from '../events';

type ConnectorConstructor = new (id: string, name: string, config: DatabaseConfig, options?: any) => BaseConnector;

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

export class ConnectorRegistry {
  static getSource(name: string, id: string, config: DatabaseConfig, options?: any): BaseConnector {
    const cls = sources.get(name);
    if (!cls) {
      throw new Error(`Unknown source connector: ${name}. Available: ${sources.keys()}`);
    }
    return new cls(id, name, config, options);
  }

  static getTarget(name: string, id: string, config: DatabaseConfig, options?: any): BaseConnector {
    const cls = targets.get(name);
    if (!cls) {
      throw new Error(`Unknown target connector: ${name}. Available: ${targets.keys()}`);
    }
    return new cls(id, name, config, options);
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
