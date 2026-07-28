# Pulsyn Connection Patterns

## Overview
Common connection patterns for all connector types.

## Database Connection Pattern

### Standard JDBC/ODBC Pattern
```typescript
@registerSource('new-db')
export class NewDBConnector extends BaseConnector {
    private pool: any = null;
    
    async connect(config: DatabaseConfig): Promise<void> {
        this.config = config;
        this.pool = new Pool({
            host: config.host,
            port: config.port || 5432,
            database: config.database,
            user: config.username,
            password: config.password,
            ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
            max: 10,
            connectionTimeoutMillis: 10000,
        });
        await this.pool.query('SELECT 1');
        this.connected = true;
    }
    
    async disconnect(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
        this.connected = false;
    }
    
    async testConnection(): Promise<boolean> {
        try {
            if (!this.pool) return false;
            const result = await this.pool.query('SELECT 1 AS ok');
            return result.rows[0]?.ok === 1;
        } catch {
            return false;
        }
    }
}
```

### Connection Pool Configuration
```typescript
const poolConfig = {
    max: 10,                    // Maximum connections
    min: 2,                     // Minimum connections
    idleTimeoutMillis: 30000,   // Close idle connections after 30s
    connectionTimeoutMillis: 10000,  // Timeout for new connections
};
```

## REST API Connection Pattern

### Standard REST API Pattern
```typescript
@registerSource('new-saas')
export class NewSaaSConnector extends BaseConnector {
    private baseUrl = '';
    private apiKey = '';
    
    async connect(config: DatabaseConfig): Promise<void> {
        this.config = config;
        this.baseUrl = config.host;
        this.apiKey = config.password;
        
        // Test connection
        const ok = await this.testConnection();
        if (!ok) throw new Error('Connection test failed');
        this.connected = true;
    }
    
    async disconnect(): Promise<void> {
        this.connected = false;
    }
    
    async testConnection(): Promise<boolean> {
        try {
            const res = await fetch(`${this.baseUrl}/health`, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return res.ok;
        } catch {
            return false;
        }
    }
}
```

### OAuth2 Connection Pattern
```typescript
@registerSource('new-oauth')
export class NewOAuthConnector extends BaseConnector {
    private accessToken = '';
    private refreshToken = '';
    
    async connect(config: DatabaseConfig): Promise<void> {
        this.config = config;
        await this.authenticate();
        this.connected = true;
    }
    
    private async authenticate(): Promise<void> {
        const res = await fetch('https://auth.example.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: this.config.refreshToken,
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
            })
        });
        const data = await res.json();
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
    }
}
```

## WebSocket Connection Pattern

### Real-time Connection Pattern
```typescript
@registerSource('new-realtime')
export class NewRealtimeConnector extends BaseConnector {
    private ws: WebSocket | null = null;
    
    async connect(config: DatabaseConfig): Promise<void> {
        this.config = config;
        this.ws = new WebSocket(config.host);
        
        await new Promise((resolve, reject) => {
            this.ws!.onopen = resolve;
            this.ws!.onerror = reject;
        });
        
        this.connected = true;
    }
    
    async disconnect(): Promise<void> {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
    }
}
```

## Error Handling Patterns

### Retry with Exponential Backoff
```typescript
async withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err as Error;
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 100;
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
    throw lastError;
}
```

### Circuit Breaker Pattern
```typescript
class CircuitBreaker {
    private failures = 0;
    private lastFailure = 0;
    private state: 'closed' | 'open' | 'half-open' = 'closed';
    
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailure > 60000) {
                this.state = 'half-open';
            } else {
                throw new Error('Circuit breaker is open');
            }
        }
        
        try {
            const result = await fn();
            this.failures = 0;
            this.state = 'closed';
            return result;
        } catch (err) {
            this.failures++;
            this.lastFailure = Date.now();
            if (this.failures >= 5) {
                this.state = 'open';
            }
            throw err;
        }
    }
}
```
