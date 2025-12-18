/**
 * Logger Utility
 *
 * Standardized logging with module context, timestamps, and detailed error information.
 * Use this instead of console.log/error/warn for better debugging.
 *
 * Usage:
 * Logger.error('ComposersScreen', 'Failed to load composers', { error: err.message });
 * Logger.info('DataService', 'Loaded 50 composers');
 * Logger.warn('NetworkService', 'Slow connection detected');
 */

export interface LogContext {
  [key: string]: any;
  timestamp?: string;
  error?: string;
}

/**
 * Logger class for standardized error/warning/info logging
 */
export class Logger {
  /**
   * Format log message with module context
   */
  private static formatMessage(module: string, message: string): string {
    return `[${module}] ${message}`;
  }

  /**
   * Format context with timestamp
   */
  private static formatContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    return {
      ...context,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Sanitize sensitive data from context
   */
  private static sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'auth', 'credentials'];
    const sanitized = { ...context };

    for (const key of sensitiveKeys) {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Log an error message
   *
   * @param module Module/component name where error occurred
   * @param message Human-readable error message
   * @param context Additional context (error details, user ID, etc)
   *
   * @example
   * Logger.error('ComposersScreen', 'Failed to fetch composers', {
   *   error: error.message,
   *   endpoint: '/api/composers',
   * });
   */
  static error(module: string, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(module, message);
    const sanitizedContext = this.sanitizeContext(this.formatContext(context));

    if (sanitizedContext) {
      console.error(formattedMessage, sanitizedContext);
    } else {
      console.error(formattedMessage);
    }

    // In production, you could send to error tracking service (Sentry, etc)
    // e.g., Sentry.captureException(new Error(formattedMessage), { contexts: { ...sanitizedContext } });
  }

  /**
   * Log a warning message
   *
   * @param module Module/component name
   * @param message Warning message
   * @param context Additional context
   *
   * @example
   * Logger.warn('AudioContext', 'Audio playback not available', {
   *   device: 'iOS',
   *   reason: 'Headphones disconnected',
   * });
   */
  static warn(module: string, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(module, message);
    const sanitizedContext = this.sanitizeContext(this.formatContext(context));

    if (sanitizedContext) {
      console.warn(formattedMessage, sanitizedContext);
    } else {
      console.warn(formattedMessage);
    }
  }

  /**
   * Log informational message
   *
   * @param module Module/component name
   * @param message Info message
   * @param context Additional context
   *
   * @example
   * Logger.info('DataService', 'Data loaded successfully', {
   *   itemCount: 50,
   *   loadTime: '245ms',
   * });
   */
  static info(module: string, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(module, message);
    const sanitizedContext = this.sanitizeContext(this.formatContext(context));

    if (sanitizedContext) {
      console.log(formattedMessage, sanitizedContext);
    } else {
      console.log(formattedMessage);
    }
  }

  /**
   * Log performance metric
   *
   * @param module Module/component name
   * @param operation Operation name
   * @param durationMs Duration in milliseconds
   * @param context Additional context
   *
   * @example
   * Logger.performance('DataService', 'getComposers', 245, { itemCount: 50 });
   */
  static performance(
    module: string,
    operation: string,
    durationMs: number,
    context?: LogContext
  ): void {
    const message = `${operation} completed in ${durationMs}ms`;
    const level = durationMs > 1000 ? 'warn' : 'info';
    
    if (level === 'warn') {
      this.warn(module, message, {
        ...context,
        duration: `${durationMs}ms`,
        performance: 'slow',
      });
    } else {
      this.info(module, message, {
        ...context,
        duration: `${durationMs}ms`,
        performance: 'ok',
      });
    }
  }

  /**
   * Log network request
   *
   * @param module Module/component name
   * @param method HTTP method
   * @param url URL endpoint
   * @param statusCode HTTP status code (200, 404, etc)
   * @param durationMs Duration in milliseconds
   *
   * @example
   * Logger.network('DataService', 'GET', '/api/composers', 200, 245);
   */
  static network(
    module: string,
    method: string,
    url: string,
    statusCode: number,
    durationMs: number
  ): void {
    const statusText = statusCode >= 200 && statusCode < 300 ? '✓' : '✗';
    const message = `${statusText} ${method} ${url} (${statusCode}) - ${durationMs}ms`;

    if (statusCode >= 200 && statusCode < 300) {
      this.info(module, message, {
        method,
        url,
        statusCode,
        duration: `${durationMs}ms`,
        success: true,
      });
    } else if (statusCode >= 400 && statusCode < 500) {
      this.warn(module, message, {
        method,
        url,
        statusCode,
        duration: `${durationMs}ms`,
        success: false,
        errorType: 'client_error',
      });
    } else if (statusCode >= 500) {
      this.error(module, message, {
        method,
        url,
        statusCode,
        duration: `${durationMs}ms`,
        success: false,
        errorType: 'server_error',
      });
    } else {
      this.error(module, message, {
        method,
        url,
        statusCode,
        duration: `${durationMs}ms`,
        success: false,
        errorType: 'network_error',
      });
    }
  }

  /**
   * Create a logger instance for a specific module
   * Useful for reducing boilerplate in components
   *
   * @param module Module name
   * @returns Logger instance bound to that module
   *
   * @example
   * const log = Logger.module('ComposersScreen');
   * log.error('Failed to load', { reason: 'Network error' });
   */
  static module(moduleName: string) {
    return {
      error: (message: string, context?: LogContext) =>
        this.error(moduleName, message, context),
      warn: (message: string, context?: LogContext) =>
        this.warn(moduleName, message, context),
      info: (message: string, context?: LogContext) =>
        this.info(moduleName, message, context),
      performance: (operation: string, duration: number, context?: LogContext) =>
        this.performance(moduleName, operation, duration, context),
      network: (method: string, url: string, status: number, duration: number) =>
        this.network(moduleName, method, url, status, duration),
    };
  }
}

/**
 * Create a module-specific logger
 * @param moduleName Name of the module (e.g., 'ComposersScreen', 'DataService')
 * @returns Logger instance bound to that module
 *
 * @example
 * const log = createLogger('ComposersScreen');
 * log.error('Failed to load composers');
 */
export function createLogger(moduleName: string) {
  return Logger.module(moduleName);
}
