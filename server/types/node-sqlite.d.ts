/**
 * Ambient type definitions for Node.js built-in SQLite module (node:sqlite)
 * Available natively in Node.js v22+
 */
declare module 'node:sqlite' {
  export interface RunResult {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  export interface StatementSync {
    all(...params: any[]): any[];
    get(...params: any[]): any;
    run(...params: any[]): RunResult;
  }

  export class DatabaseSync {
    constructor(location: string, options?: { open?: boolean });
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
