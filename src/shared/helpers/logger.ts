/* eslint-disable no-console */

export class Logger {
  private static formatMessage(level: string, message: string): string {
    return `[${level}] ${new Date().toISOString()} - ${message}`;
  }

  static info(message: string, ...args: unknown[]): void {
    console.log(Logger.formatMessage('INFO', message), ...args);
  }

  static warn(message: string, ...args: unknown[]): void {
    console.warn(Logger.formatMessage('WARN', message), ...args);
  }

  static error(message: string, ...args: unknown[]): void {
    console.error(Logger.formatMessage('ERROR', message), ...args);
  }
}
