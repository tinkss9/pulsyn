// @ts-nocheck
// Connector Registry Unit Tests
import { describe, it, expect } from 'vitest';
import { ConnectorRegistry } from '../../connectors/registry';
// Import connectors to trigger registration via decorators
import '../../connectors/postgresql';
import '../../connectors/mysql';
import '../../connectors/mongodb';
import '../../targets/snowflake';
import '../../targets/bigquery';

describe('ConnectorRegistry', () => {
  it('should list registered sources', () => {
    const sources = ConnectorRegistry.listSources();
    expect(sources.length).toBeGreaterThan(0);
  });

  it('should list registered targets', () => {
    const targets = ConnectorRegistry.listTargets();
    expect(targets.length).toBeGreaterThan(0);
  });

  it('should check if connector exists', () => {
    const sources = ConnectorRegistry.listSources();
    if (sources.length > 0) {
      expect(ConnectorRegistry.has(sources[0])).toBe(true);
    }
    expect(ConnectorRegistry.has('nonexistent')).toBe(false);
  });

  it('should list all connectors', () => {
    const all = ConnectorRegistry.listAll();
    expect(all.sources.length).toBeGreaterThan(0);
  });

  it('should throw for unknown source', () => {
    expect(() => ConnectorRegistry.getSource('nonexistent', 'id', {} as any)).toThrow('Unknown source connector');
  });

  it('should throw for unknown target', () => {
    expect(() => ConnectorRegistry.getTarget('nonexistent', 'id', {} as any)).toThrow('Unknown target connector');
  });
});

