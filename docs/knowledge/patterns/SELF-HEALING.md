# Pulsyn Self-Healing Patterns

## Overview
Self-healing patterns for connector development.

## Retry Pattern

### Exponential Backoff
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

### Retry with Jitter
```typescript
async withRetryJitter<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err as Error;
            if (attempt < maxRetries) {
                const baseDelay = Math.pow(2, attempt) * 100;
                const jitter = Math.random() * 100;
                const delay = baseDelay + jitter;
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
    throw lastError;
}
```

## Circuit Breaker Pattern

### Basic Circuit Breaker
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

### Advanced Circuit Breaker with Half-Open
```typescript
class AdvancedCircuitBreaker {
    private failures = 0;
    private successes = 0;
    private lastFailure = 0;
    private state: 'closed' | 'open' | 'half-open' = 'closed';
    private halfOpenAttempts = 0;
    
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailure > 60000) {
                this.state = 'half-open';
                this.halfOpenAttempts = 0;
            } else {
                throw new Error('Circuit breaker is open');
            }
        }
        
        if (this.state === 'half-open') {
            this.halfOpenAttempts++;
            if (this.halfOpenAttempts > 3) {
                this.state = 'closed';
                this.failures = 0;
            }
        }
        
        try {
            const result = await fn();
            this.successes++;
            this.failures = 0;
            if (this.state === 'half-open' && this.successes >= 3) {
                this.state = 'closed';
            }
            return result;
        } catch (err) {
            this.failures++;
            this.successes = 0;
            this.lastFailure = Date.now();
            if (this.failures >= 5) {
                this.state = 'open';
            }
            throw err;
        }
    }
}
```

## Fallback Pattern

### Fallback to Alternative Connector
```typescript
async withFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>
): Promise<T> {
    try {
        return await primary();
    } catch (err) {
        console.warn('Primary failed, trying fallback:', err);
        return await fallback();
    }
}
```

### Fallback with Cache
```typescript
class CachedFallback<T> {
    private cache: T | null = null;
    private cacheTime = 0;
    private cacheTTL = 60000; // 1 minute
    
    async execute(
        primary: () => Promise<T>,
        fallback: () => Promise<T>
    ): Promise<T> {
        try {
            const result = await primary();
            this.cache = result;
            this.cacheTime = Date.now();
            return result;
        } catch (err) {
            if (this.cache && Date.now() - this.cacheTime < this.cacheTTL) {
                console.warn('Primary failed, using cache');
                return this.cache;
            }
            console.warn('Primary failed, cache expired, trying fallback');
            return await fallback();
        }
    }
}
```

## Health Check Pattern

### Periodic Health Check
```typescript
class HealthChecker {
    private interval: NodeJS.Timeout | null = null;
    private healthy = true;
    
    start(checkFn: () => Promise<boolean>, intervalMs: number = 30000) {
        this.interval = setInterval(async () => {
            try {
                this.healthy = await checkFn();
            } catch {
                this.healthy = false;
            }
        }, intervalMs);
    }
    
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    isHealthy(): boolean {
        return this.healthy;
    }
}
```

## Self-Healing Loop

### Basic Self-Healing
```typescript
async function selfHeal<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    healFn?: (error: Error) => Promise<void>
): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err as Error;
            
            if (healFn && attempt < maxRetries) {
                await healFn(lastError);
            }
            
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 100;
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
    
    throw lastError;
}
```

### Advanced Self-Healing with Learning
```typescript
class SelfHealingSystem {
    private memory: Map<string, { error: string; solution: string }> = new Map();
    
    async execute<T>(
        fn: () => Promise<T>,
        context: string
    ): Promise<T> {
        try {
            return await fn();
        } catch (err) {
            const error = err as Error;
            const key = `${context}:${error.message}`;
            
            // Check if we've seen this error before
            const known = this.memory.get(key);
            if (known) {
                console.log(`Applying known solution for: ${error.message}`);
                // Apply known solution
            }
            
            // Try to heal
            const healed = await this.heal(error, context);
            if (healed) {
                return await fn();
            }
            
            throw error;
        }
    }
    
    private async heal(error: Error, context: string): Promise<boolean> {
        // Analyze error
        // Generate solution
        // Store in memory
        // Return true if healed
        return false;
    }
}
```
