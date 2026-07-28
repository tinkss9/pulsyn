# Pulsyn Testing Patterns

## Overview
Testing patterns inspired by Mockito and best practices.

## Mockito-Inspired Patterns

### Test Spy Model
```typescript
// Stub, execute, verify (not expect-run-verify)
describe('PostgreSQL Connector', () => {
    let connector: PostgreSQLConnector;
    let mockPool: MockPool;
    
    beforeEach(() => {
        mockPool = new MockPool();
        connector = new PostgreSQLConnector('test', 'test', mockPool);
    });
    
    it('should retry on transient failure', async () => {
        // Given
        mockPool.failNextAttempts(2);
        
        // When
        await connector.connect(config);
        
        // Then
        expect(mockPool.connectionAttempts).toBe(3);
        expect(connector.isConnected()).toBe(true);
    });
});
```

### @Spy Abstract Fakes
```typescript
// For connectors with state (connection pools, retry logic)
abstract class FakeConnector implements Connector {
    private connected = false;
    
    async connect(config: DatabaseConfig): Promise<void> {
        this.connected = true;
    }
    
    async disconnect(): Promise<void> {
        this.connected = false;
    }
    
    isConnected(): boolean {
        return this.connected;
    }
}

// Usage in tests
@Spy FakeConnector connector;
```

### ArgumentCaptor
```typescript
// Capture what code passes to connectors
describe('Connector Tests', () => {
    it('should capture query parameters', async () => {
        // Given
        const captor = new ArgumentCaptor();
        
        // When
        await connector.extractFull('users');
        
        // Then
        expect(captor.capture().query).toContain('SELECT * FROM users');
    });
});
```

### BDD Syntax
```typescript
// Given-When-Then for readable test scenarios
describe('Connector Tests', () => {
    it('should extract all rows', async () => {
        // Given
        await connector.connect(config);
        
        // When
        const events = await connector.extractFull('users');
        
        // Then
        expect(events.length).toBeGreaterThan(0);
        expect(events[0].op).toBe('S');
    });
});
```

## Test Utilities

### Connector Fixtures
```typescript
// Factory methods for test data
class ConnectorFixtures {
    static postgresConfig(): DatabaseConfig {
        return {
            host: 'localhost',
            port: 5432,
            database: 'testdb',
            username: 'test',
            password: 'test',
        };
    }
    
    static snowflakeConfig(): DatabaseConfig {
        return {
            host: 'account.snowflakecomputing.com',
            port: 443,
            database: 'testdb',
            username: 'svc_account',
            password: 'test',
        };
    }
}
```

### Mock Pool
```typescript
// Mock connection pool for testing
class MockPool {
    private failAttempts = 0;
    private attempts = 0;
    
    failNextAttempts(n: number) {
        this.failAttempts = n;
    }
    
    get connectionAttempts() {
        return this.attempts;
    }
    
    async query(sql: string, params?: any[]) {
        this.attempts++;
        if (this.attempts <= this.failAttempts) {
            throw new Error('Transient failure');
        }
        return { rows: [], rowCount: 0 };
    }
}
```

## Test Categories

### Unit Tests
- Test connector logic in isolation
- Mock external dependencies
- Fast execution
- No Docker required

### Integration Tests
- Test connector with real database
- Use Docker containers
- Slower execution
- Requires Docker

### E2E Tests
- Test full pipeline
- Source → Target replication
- Data integrity verification
- Performance benchmarks

### Benchmark Tests
- Measure latency
- Measure throughput
- Measure memory usage
- Compare with competitors

## Test Runner Framework

### ConnectorTestRunner
```typescript
class ConnectorTestRunner {
    private config: ConnectorTestConfig;
    
    constructor(config: ConnectorTestConfig) {
        this.config = config;
    }
    
    runUnitTests() {
        describe(`${this.config.engine} Unit Tests`, () => {
            // Unit test implementation
        });
    }
    
    runIntegrationTests() {
        describe(`${this.config.engine} Integration Tests`, () => {
            // Integration test implementation
        });
    }
    
    runE2ETests() {
        describe(`${this.config.engine} E2E Tests`, () => {
            // E2E test implementation
        });
    }
    
    runBenchmarkTests() {
        describe(`${this.config.engine} Benchmarks`, () => {
            // Benchmark implementation
        });
    }
}
```

### Custom Assertions
```typescript
// Connectivity assertions
async function expectConnect(connector: BaseConnector, config?: any): Promise<void> {
    await connector.connect(config);
    expect(connector.isConnected()).toBe(true);
}

// Extraction assertions
async function expectExtractFull(
    connector: BaseConnector,
    table: string,
    minRows: number = 1
): Promise<UnifiedChangeEvent[]> {
    const events = await connector.extractFull(table);
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThanOrEqual(minRows);
    return events;
}

// Performance assertions
function expectLatency(startTime: number, maxLatencyMs: number): void {
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThanOrEqual(maxLatencyMs);
}
```
