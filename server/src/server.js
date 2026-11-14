import http from 'node:http';
import { pathToFileURL } from 'node:url';
import crypto from 'node:crypto';

import config from '#config/index.js';
import logger from '#logger.js';
import { createApp } from '#config/app.js';
import { initializeDatabase, closeConnection } from '#database/connection.js';
import { closeRedis } from '#config/redis.config.js';

/**
 * Process entrypoint.
 *
 * DEFECTS FIXED
 * -------------
 *  1. `initializeDatabase()` was never called. The process bound a port and
 *     reported "listening" with no database connection, then returned 500 for
 *     every request.
 *  2. No signal handling. SIGTERM killed the process mid-request, which for a
 *     transfer means a debit committed and a credit that never happened.
 *  3. No `unhandledRejection` / `uncaughtException` handlers, so one stray
 *     promise rejection in a background task took the whole service down without
 *     a trace.
 *  4. Security-critical config was never validated at boot — see `config/index.js`
 *     for the JWT secret fail-fast.
 */

const SHUTDOWN_TIMEOUT_MS = 10000;

const start = async () => {
  // Fails fast when NODE_ENV=production and a secret is missing or weak.
  const app = createApp();
  const server = http.createServer(app);

  await initializeDatabase();

  server.listen(config.server.port, config.server.host, () => {
    logger.info('Server listening', {
      port: config.server.port,
      host: config.server.host,
      env: config.env,
      pid: process.pid,
    });
    if (!config.isProduction) {
      logger.warn('Running in development mode. Do not use this configuration in production.');
    }
  });

  server.keepAliveTimeout = 65000; // must exceed the load balancer's idle timeout
  server.headersTimeout = 66000;
  server.requestTimeout = 30000;

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info('Shutting down gracefully', { signal });

    const forceExit = setTimeout(() => {
      logger.error('Graceful shutdown timed out; forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    // Stop accepting new work, let in-flight requests finish, then close handles.
    server.close(async () => {
      try {
        await closeRedis();
        await closeConnection();
        logger.info('Shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { message: error.message });
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    // Log and keep serving: an unawaited promise in a background task should not
    // cost the process. Anything affecting a request is handled by the middleware.
    logger.error('Unhandled promise rejection', {
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });

  process.on('uncaughtException', (error) => {
    // Here the process state is unknown, so log and exit — the orchestrator
    // restarts it. Exiting is correct; carrying on with corrupted state is not.
    logger.error('Uncaught exception; exiting', { message: error.message, stack: error.stack });
    process.exit(1);
  });

  return server;
};

/**
 * Only boot when this file is the entrypoint.
 *
 * `start()` ran unconditionally at module scope, so merely importing the module —
 * from a test, a health-check harness or a smoke script — opened a database
 * connection and called `process.exit(1)` when it failed. Guarding on the
 * entrypoint makes the server importable and therefore testable.
 */
const isEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  start().catch((error) => {
    logger.error('Failed to start the server', { message: error.message, stack: error.stack });
    process.exit(1);
  });
}

export { start };
export default start;
