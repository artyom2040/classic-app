/**
 * Tests for Logger utility
 */

import { Logger, createLogger } from '../../utils/logger';

describe('Logger', () => {
    let consoleSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        warnSpy = jest.spyOn(console, 'warn').mockImplementation();
        errorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });

    describe('info', () => {
        it('should format message with module name', () => {
            Logger.info('TestModule', 'Test message');
            expect(consoleSpy).toHaveBeenCalledWith('[TestModule] Test message');
        });

        it('should include context with timestamp', () => {
            Logger.info('TestModule', 'Test message', { foo: 'bar' });
            expect(consoleSpy).toHaveBeenCalledWith(
                '[TestModule] Test message',
                expect.objectContaining({
                    foo: 'bar',
                    timestamp: expect.any(String),
                })
            );
        });
    });

    describe('warn', () => {
        it('should call console.warn', () => {
            Logger.warn('TestModule', 'Warning message');
            expect(warnSpy).toHaveBeenCalledWith('[TestModule] Warning message');
        });
    });

    describe('error', () => {
        it('should call console.error', () => {
            Logger.error('TestModule', 'Error message');
            expect(errorSpy).toHaveBeenCalledWith('[TestModule] Error message');
        });
    });

    describe('sanitization', () => {
        it('should redact top-level sensitive keys', () => {
            Logger.info('TestModule', 'Test', { password: 'secret123', username: 'user' });
            expect(consoleSpy).toHaveBeenCalledWith(
                '[TestModule] Test',
                expect.objectContaining({
                    password: '[REDACTED]',
                    username: 'user',
                })
            );
        });

        it('should redact nested sensitive keys', () => {
            Logger.info('TestModule', 'Test', {
                user: {
                    name: 'John',
                    password: 'secret123',
                    // Use 'settings' instead of 'credentials' since 'credentials' itself is a sensitive key
                    settings: { apiKey: 'key123' }
                }
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[TestModule] Test',
                expect.objectContaining({
                    user: expect.objectContaining({
                        name: 'John',
                        password: '[REDACTED]',
                        settings: expect.objectContaining({
                            apiKey: '[REDACTED]',
                        }),
                    }),
                })
            );
        });

        it('should handle authorization header', () => {
            Logger.info('TestModule', 'Test', { headers: { authorization: 'Bearer token' } });
            expect(consoleSpy).toHaveBeenCalledWith(
                '[TestModule] Test',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        authorization: '[REDACTED]',
                    }),
                })
            );
        });

        it('should sanitize arrays', () => {
            Logger.info('TestModule', 'Test', {
                users: [{ name: 'John', token: 'abc' }, { name: 'Jane', token: 'xyz' }]
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[TestModule] Test',
                expect.objectContaining({
                    users: [
                        expect.objectContaining({ name: 'John', token: '[REDACTED]' }),
                        expect.objectContaining({ name: 'Jane', token: '[REDACTED]' }),
                    ],
                })
            );
        });
    });

    describe('performance', () => {
        it('should log info for fast operations', () => {
            Logger.performance('TestModule', 'fastOp', 100);
            expect(consoleSpy).toHaveBeenCalled();
            expect(warnSpy).not.toHaveBeenCalled();
        });

        it('should warn for slow operations (>1000ms)', () => {
            Logger.performance('TestModule', 'slowOp', 1500);
            expect(warnSpy).toHaveBeenCalled();
        });
    });

    describe('module factory', () => {
        it('should create module-specific logger', () => {
            const log = Logger.module('MyComponent');

            log.info('Message');
            expect(consoleSpy).toHaveBeenCalledWith('[MyComponent] Message');
        });
    });

    describe('createLogger helper', () => {
        it('should create module-specific logger', () => {
            const log = createLogger('CustomModule');

            log.info('Test');
            expect(consoleSpy).toHaveBeenCalledWith('[CustomModule] Test');
        });
    });
});
