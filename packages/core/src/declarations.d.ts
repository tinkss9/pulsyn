declare module 'pg' {
  export class Pool {
    constructor(config?: any);
    connect(): Promise<any>;
    query(text: string, params?: any[]): Promise<any>;
    end(): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): void;
  }
  export class PoolClient {
    query(text: string, params?: any[]): Promise<any>;
    release(): void;
  }
  export interface QueryResult {
    rows: any[];
    rowCount: number;
  }
  export interface PoolConfig {
    [key: string]: any;
  }
}

declare module 'mysql2/promise' {
  export function createConnection(config?: any): Promise<any>;
  export function createPool(config?: any): any;
  export class Pool {
    constructor(config?: any);
    getConnection(): Promise<any>;
    query(text: string, params?: any[]): Promise<any>;
    end(): Promise<void>;
  }
  export interface PoolConfig {
    [key: string]: any;
  }
}
