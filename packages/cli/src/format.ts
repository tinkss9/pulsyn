// Pulsyn CLI Output Formatting

import chalk from 'chalk';
import { loadConfig } from './config';

export function output(data: unknown, tableFn?: (data: unknown) => void): void {
  const config = loadConfig();

  if (config.outputFormat === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (tableFn) {
    tableFn(data);
    return;
  }

  // Default: pretty-print object
  if (typeof data === 'object' && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      console.log(`  ${chalk.gray(key)}: ${formatValue(value)}`);
    }
  } else {
    console.log(String(data));
  }
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return chalk.gray('—');
  if (typeof value === 'boolean') return value ? chalk.green('yes') : chalk.red('no');
  if (typeof value === 'number') return chalk.yellow(value.toLocaleString());
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return `[${value.length} items]`;
  return JSON.stringify(value);
}

export function error(message: string): void {
  console.error(chalk.red(`✖ ${message}`));
}

export function success(message: string): void {
  console.log(chalk.green(`✔ ${message}`));
}

export function warn(message: string): void {
  console.log(chalk.yellow(`⚠ ${message}`));
}

export function info(message: string): void {
  console.log(chalk.blue(`ℹ ${message}`));
}

export function header(text: string): void {
  console.log(chalk.bold.underline(text));
}

export function keyValue(key: string, value: unknown): void {
  console.log(`  ${chalk.gray(key + ':')} ${formatValue(value)}`);
}

export function statusBadge(status: string): string {
  switch (status) {
    case 'running':
      return chalk.green(status);
    case 'idle':
    case 'stopped':
      return chalk.gray(status);
    case 'paused':
      return chalk.yellow(status);
    case 'error':
      return chalk.red(status);
    default:
      return status;
  }
}

export function table(headers: string[], rows: string[][]): void {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] || '').length))
  );

  const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join('  ');
  const separator = widths.map(w => '─'.repeat(w)).join('──');

  console.log(chalk.bold(headerLine));
  console.log(chalk.gray(separator));

  for (const row of rows) {
    console.log(row.map((cell, i) => (cell || '').padEnd(widths[i])).join('  '));
  }
}
