# Pulsyn Common Failures

## Overview
Most common failures in connector development and their solutions.

## Connection Failures

### 1. Connection Timeout
**Error:** `Connection timed out after 10000ms`

**Root Cause:**
- Network latency
- Firewall blocking connection
- Database server not running

**Solution:**
```typescript
async connect(config: DatabaseConfig): Promise<void> {
    const connectTimeout = (config as any).connectTimeout || 30000;
    this.pool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.username,
        password: config.password,
        connectionTimeoutMillis: connectTimeout,
    });
}
```

**Prevention:**
- Use connection pooling
- Set appropriate timeouts
- Implement retry logic

### 2. Authentication Failed
**Error:** `Authentication failed for user 'test'`

**Root Cause:**
- Wrong credentials
- User doesn't exist
- Password expired

**Solution:**
```typescript
async connect(config: DatabaseConfig): Promise<void> {
    // Validate credentials before connecting
    if (!config.username || !config.password) {
        throw new Error('Username and password required');
    }
    
    try {
        await this.pool.query('SELECT 1');
    } catch (err) {
        if ((err as Error).message.includes('authentication')) {
            throw new Error('Invalid credentials');
        }
        throw err;
    }
}
```

**Prevention:**
- Validate credentials before connecting
- Use environment variables for credentials
- Implement credential rotation

### 3. Database Not Found
**Error:** `Database "testdb" does not exist`

**Root Cause:**
- Wrong database name
- Database not created
- Permissions issue

**Solution:**
```typescript
async connect(config: DatabaseConfig): Promise<void> {
    try {
        await this.pool.query('SELECT 1');
    } catch (err) {
        if ((err as Error).message.includes('does not exist')) {
            throw new Error(`Database ${config.database} does not exist`);
        }
        throw err;
    }
}
```

**Prevention:**
- Validate database exists before connecting
- Use default database if specified doesn't exist
- Implement database creation if needed

## Extraction Failures

### 1. Table Not Found
**Error:** `Table "users" does not exist`

**Root Cause:**
- Wrong table name
- Table not created
- Schema mismatch

**Solution:**
```typescript
async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    // Validate table exists
    const tables = await this.getTables();
    if (!tables.includes(table)) {
        throw new Error(`Table ${table} does not exist`);
    }
    
    // Extract data
    const result = await this.pool.query(`SELECT * FROM ${table}`);
    return result.rows.map(row => createEvent({
        op: 'S',
        table,
        after: row,
        before: null,
    }));
}
```

**Prevention:**
- Validate table exists before extraction
- Use schema discovery
- Handle missing tables gracefully

### 2. Column Not Found
**Error:** `Column "updated_at" does not exist`

**Root Cause:**
- Wrong column name
- Column not created
- Schema mismatch

**Solution:**
```typescript
async extractIncremental(table: string, opts?: { 
    watermarkColumn?: string; 
    watermarkValue?: string 
}): Promise<UnifiedChangeEvent[]> {
    const wmCol = opts?.watermarkColumn || 'updated_at';
    
    // Validate column exists
    const schema = await this.getTableSchema(table);
    const columnExists = schema.columns.some(c => c.name === wmCol);
    if (!columnExists) {
        throw new Error(`Column ${wmCol} does not exist in ${table}`);
    }
    
    // Extract data
    const result = await this.pool.query(
        `SELECT * FROM ${table} WHERE ${wmCol} > $1`,
        [opts?.watermarkValue]
    );
    return result.rows.map(row => createEvent({
        op: 'I',
        table,
        after: row,
        before: null,
    }));
}
```

**Prevention:**
- Validate column exists before extraction
- Use schema discovery
- Handle missing columns gracefully

### 3. Permission Denied
**Error:** `Permission denied for table "users"`

**Root Cause:**
- User doesn't have SELECT permission
- Table is in different schema
- Row-level security

**Solution:**
```typescript
async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    try {
        const result = await this.pool.query(`SELECT * FROM ${table}`);
        return result.rows.map(row => createEvent({
            op: 'S',
            table,
            after: row,
            before: null,
        }));
    } catch (err) {
        if ((err as Error).message.includes('permission denied')) {
            throw new Error(`Permission denied for table ${table}`);
        }
        throw err;
    }
}
```

**Prevention:**
- Validate permissions before extraction
- Use appropriate user for extraction
- Implement permission checking

## CDC Failures

### 1. Replication Slot Not Found
**Error:** `Replication slot "pulsyn_test" does not exist`

**Root Cause:**
- Slot not created
- Slot dropped
- Slot name mismatch

**Solution:**
```typescript
async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    const slotName = `pulsyn_${this.id.replace(/-/g, '_')}`;
    
    // Create slot if it doesn't exist
    try {
        await this.replicationClient.query(
            `SELECT pg_create_logical_replication_slot('${slotName}', 'wal2json')`
        );
    } catch (err) {
        if (!(err as Error).message.includes('already exists')) {
            throw err;
        }
    }
    
    // Start polling
    this.cdcActive = true;
    this.pollSlot(slotName, callback);
}
```

**Prevention:**
- Create slot before starting CDC
- Handle slot already exists
- Implement slot cleanup

### 2. WAL Level Not Set
**Error:** `logical decoding requires wal_level >= logical`

**Root Cause:**
- WAL level not set to logical
- PostgreSQL configuration issue

**Solution:**
```typescript
async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    // Check WAL level
    const result = await this.pool.query(
        "SHOW wal_level"
    );
    if (result.rows[0].wal_level !== 'logical') {
        throw new Error('WAL level must be set to logical for CDC');
    }
    
    // Start CDC
    // ...
}
```

**Prevention:**
- Check WAL level before starting CDC
- Document WAL level requirements
- Implement WAL level detection

## Performance Failures

### 1. Slow Extraction
**Error:** Extraction takes too long

**Root Cause:**
- Large table
- No pagination
- Missing indexes

**Solution:**
```typescript
async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    let offset = 0;
    const limit = this.batchSize;
    
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
            }));
        }
        
        offset += result.rows.length;
        if (result.rows.length < limit) break;
    }
    
    return events;
}
```

**Prevention:**
- Use pagination
- Add indexes on frequently queried columns
- Implement batch processing

### 2. Memory Exhaustion
**Error:** `JavaScript heap out of memory`

**Root Cause:**
- Loading too many rows into memory
- No pagination
- Large blobs

**Solution:**
```typescript
async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    let offset = 0;
    const limit = 1000; // Small batch size
    
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
            }));
        }
        
        offset += result.rows.length;
        if (result.rows.length < limit) break;
    }
    
    return events;
}
```

**Prevention:**
- Use small batch sizes
- Implement pagination
- Stream large datasets
