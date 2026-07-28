# Pulsyn Extraction Patterns

## Overview
Common extraction patterns for all connector types.

## Full Extraction Pattern

### Standard Full Extraction
```typescript
async extractFull(table: string, opts?: { limit?: number; offset?: number }): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const limit = opts?.limit || this.batchSize;
    const offset = opts?.offset || 0;
    const events: UnifiedChangeEvent[] = [];
    
    while (true) {
        const result = await this.pool.query(
            `SELECT * FROM ${table} LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        
        if (result.rows.length === 0) break;
        
        for (const row of result.rows) {
            events.push(createEvent({
                op: 'S',
                table,
                after: row,
                before: null,
                sourceMetadata: { source: this.engine }
            }));
        }
        
        offset += result.rows.length;
        if (result.rows.length < limit) break;
    }
    
    return events;
}
```

### Paginated Full Extraction
```typescript
async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const schema = await this.getTableSchema(table);
    const pk = schema.primaryKeys[0] || 'id';
    const events: UnifiedChangeEvent[] = [];
    let lastKey: any = null;
    
    while (true) {
        const query = lastKey
            ? `SELECT * FROM ${table} WHERE ${pk} > $1 ORDER BY ${pk} LIMIT $2`
            : `SELECT * FROM ${table} ORDER BY ${pk} LIMIT $1`;
        const params = lastKey ? [lastKey, this.batchSize] : [this.batchSize];
        
        const result = await this.pool.query(query, params);
        if (result.rows.length === 0) break;
        
        for (const row of result.rows) {
            events.push(createEvent({
                op: 'S',
                table,
                after: row,
                before: null,
                sourceMetadata: { source: this.engine, pk: row[pk]?.toString() }
            }));
        }
        
        lastKey = result.rows[result.rows.length - 1][pk];
        if (result.rows.length < this.batchSize) break;
    }
    
    return events;
}
```

## Incremental Extraction Pattern

### Watermark-based Incremental
```typescript
async extractIncremental(table: string, opts?: { 
    watermarkColumn?: string; 
    watermarkValue?: string 
}): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const wmCol = opts?.watermarkColumn || this.config.watermarkColumn || 'updated_at';
    const watermark = opts?.watermarkValue || null;
    const events: UnifiedChangeEvent[] = [];
    
    const query = watermark
        ? `SELECT * FROM ${table} WHERE ${wmCol} > $1 ORDER BY ${wmCol} LIMIT $2`
        : `SELECT * FROM ${table} ORDER BY ${wmCol} LIMIT $1`;
    const params = watermark ? [watermark, this.batchSize] : [this.batchSize];
    
    const result = await this.pool.query(query, params);
    
    for (const row of result.rows) {
        events.push(createEvent({
            op: 'I',
            table,
            after: row,
            before: null,
            sourceMetadata: { source: this.engine, pk: row[wmCol]?.toString() }
        }));
    }
    
    return events;
}
```

## CDC Pattern

### PostgreSQL WAL CDC
```typescript
async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.config) throw new Error('Not connected');
    
    const slotName = `pulsyn_${this.id.replace(/-/g, '_')}`;
    this.replicationClient = new Client({
        host: this.config.host,
        port: this.config.port || 5432,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        replication: 'database',
    });
    
    await this.replicationClient.connect();
    
    // Create replication slot
    try {
        await this.replicationClient.query(
            `SELECT pg_create_logical_replication_slot('${slotName}', 'wal2json')`
        );
    } catch { /* slot may already exist */ }
    
    this.cdcActive = true;
    this.pollSlot(slotName, callback);
}

private async pollSlot(slot: string, cb: (event: CDCEvent) => void): Promise<void> {
    while (this.cdcActive && this.replicationClient) {
        try {
            const res = await this.replicationClient.query(
                `SELECT data FROM pg_logical_slot_get_changes('${slot}', NULL, ${this.batchSize})`
            );
            
            for (const row of res.rows) {
                const change = JSON.parse(row.data);
                for (const c of change.change || []) {
                    const op = c.kind === 'insert' ? 'I' : c.kind === 'update' ? 'U' : 'D';
                    cb({
                        op,
                        table: `${c.schema}.${c.table}`,
                        before: c.oldkeys ? this.zip(c.oldkeys.keynames, c.oldkeys.keyvalues) : null,
                        after: c.columnvalues ? this.zip(c.columnnames, c.columnvalues) : null,
                        ts: new Date(),
                    });
                }
            }
            
            await new Promise((r) => setTimeout(r, 1000));
        } catch {
            if (this.cdcActive) await new Promise((r) => setTimeout(r, 5000));
        }
    }
}
```

### MongoDB Change Stream CDC
```typescript
async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.db) throw new Error('Not connected');
    
    this.cdcActive = true;
    this.changeStream = this.db.watch([], {
        fullDocument: 'updateLookup',
        fullDocumentBeforeChange: 'whenAvailable',
    });
    
    this.changeStream.on('change', (change: Document) => {
        if (!this.cdcActive) return;
        
        let op: 'I' | 'U' | 'D';
        let before: Record<string, any> | null = null;
        let after: Record<string, any> | null = null;
        
        switch (change.operationType) {
            case 'insert':
                op = 'I';
                after = change.fullDocument || null;
                break;
            case 'update':
            case 'replace':
                op = 'U';
                before = change.fullDocumentBeforeChange || null;
                after = change.fullDocument || null;
                break;
            case 'delete':
                op = 'D';
                before = change.fullDocumentBeforeChange || { _id: change.documentKey?._id };
                break;
            default:
                return;
        }
        
        callback({
            op,
            table: change.ns?.coll || 'unknown',
            before,
            after,
            ts: new Date(),
        });
    });
    
    this.changeStream.on('error', () => {
        if (this.cdcActive) setTimeout(() => this.startCDC(callback), 5000);
    });
}
```

## REST API Extraction Pattern

### Paginated REST API Extraction
```typescript
async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
        const res = await fetch(`${this.baseUrl}/api/${table}?page=${page}&limit=100`, {
            headers: { 'Authorization': `Bearer ${this.apiKey}` }
        });
        
        const data = await res.json();
        const items = data.items || data.data || data;
        
        if (!items || items.length === 0) {
            hasMore = false;
            break;
        }
        
        for (const item of items) {
            events.push(createEvent({
                op: 'S',
                table,
                after: item,
                before: null,
                sourceMetadata: { source: this.engine }
            }));
        }
        
        page++;
        if (items.length < 100) hasMore = false;
    }
    
    return events;
}
```
