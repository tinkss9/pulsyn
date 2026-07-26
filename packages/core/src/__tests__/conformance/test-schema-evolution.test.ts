import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseConnector } from '../../connectors/base';
import { getTestConnector, getTargetConnector, TEST_TABLE } from './conftest';

describe('Schema Evolution Conformance', () => {
  let source: BaseConnector;
  let target: BaseConnector;

  beforeEach(async () => {
    source = getTestConnector();
    target = getTargetConnector();
    await source.connect();
    await target.connect();
  });

  afterEach(async () => {
    await source.disconnect();
    await target.disconnect();
  });

  it('should detect added columns', async () => {
    const oldSchema = {
      columns: [
        { name: 'id', type: 'integer', primaryKey: true, nullable: false },
        { name: 'name', type: 'varchar', primaryKey: false, nullable: true },
      ],
    };
    const newSchema = {
      columns: [
        { name: 'id', type: 'integer', primaryKey: true, nullable: false },
        { name: 'name', type: 'varchar', primaryKey: false, nullable: true },
        { name: 'email', type: 'varchar', primaryKey: false, nullable: true },
      ],
    };

    const diff = await target.detectSchemaChanges(oldSchema, newSchema);

    expect(diff.added).toBeDefined();
    expect(diff.added.length).toBe(1);
    expect(diff.added[0].name).toBe('email');
  });

  it('should detect type widening changes', async () => {
    const oldSchema = {
      columns: [
        { name: 'id', type: 'integer', primaryKey: true, nullable: false },
        { name: 'amount', type: 'integer', primaryKey: false, nullable: true },
      ],
    };
    const newSchema = {
      columns: [
        { name: 'id', type: 'integer', primaryKey: true, nullable: false },
        { name: 'amount', type: 'bigint', primaryKey: false, nullable: true },
      ],
    };

    const diff = await target.detectSchemaChanges(oldSchema, newSchema);

    expect(diff.modified).toBeDefined();
    expect(diff.modified.length).toBe(1);
    expect(diff.modified[0].name).toBe('amount');
    expect(diff.modified[0].oldType).toBe('integer');
    expect(diff.modified[0].newType).toBe('bigint');
  });

  it('should alert on dropped columns', async () => {
    const oldSchema = {
      columns: [
        { name: 'id', type: 'integer', primaryKey: true, nullable: false },
        { name: 'name', type: 'varchar', primaryKey: false, nullable: true },
        { name: 'legacy_field', type: 'varchar', primaryKey: false, nullable: true },
      ],
    };
    const newSchema = {
      columns: [
        { name: 'id', type: 'integer', primaryKey: true, nullable: false },
        { name: 'name', type: 'varchar', primaryKey: false, nullable: true },
      ],
    };

    const diff = await target.detectSchemaChanges(oldSchema, newSchema);

    expect(diff.removed).toBeDefined();
    expect(diff.removed.length).toBe(1);
    expect(diff.removed[0].name).toBe('legacy_field');
  });

  it('should detect renamed columns via heuristic', async () => {
    const oldSchema = {
      columns: [
        { name: 'id', type: 'integer', primaryKey: true, nullable: false },
        { name: 'full_name', type: 'varchar', primaryKey: false, nullable: true },
      ],
    };
    const newSchema = {
      columns: [
        { name: 'id', type: 'integer', primaryKey: true, nullable: false },
        { name: 'display_name', type: 'varchar', primaryKey: false, nullable: true },
      ],
    };

    const diff = await target.detectSchemaChanges(oldSchema, newSchema);

    const hasRename = diff.renamed && diff.renamed.length > 0;
    const hasRemoveAndAdd = diff.removed?.length > 0 && diff.added?.length > 0;
    expect(hasRename || hasRemoveAndAdd).toBe(true);
  });
});
