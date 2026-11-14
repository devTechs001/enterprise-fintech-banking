import { Sequelize } from 'sequelize';

import config from '#config/index.js';
import logger from '#logger.js';

/**
 * Sequelize connection.
 *
 * Three defects fixed:
 *  1. `testConnection()` caught its own error and `return false`, so
 *     `initializeDatabase()` logged a warning and let the process keep running
 *     with no database. The service would then return 500s for everything while
 *     reporting "listening".
 *  2. `initializeDatabase()` was exported but never called from `server.js`, and
 *     `sync()` ran without `{ alter: true }` control, so the configured
 *     `sequelize.sync({ alter: true })` could silently rewrite live column types.
 *  3. This file imported `@/config` — an alias with no resolver in the server
 *     package. The whole server now uses Node's native `#` subpath imports.
 */

const buildUri = () => {
  if (config.database.url) return config.database.url;
  const { user, password, host, port, name } = config.database;
  if (!user || !name) return null;
  const auth = password ? `${user}:${encodeURIComponent(password)}` : user;
  return `postgres://${auth}@${host}:${port}/${name}`;
};

const uri = buildUri();

/**
 * Constructing `new Sequelize(null, {...})` throws
 * `TypeError [ERR_INVALID_ARG_TYPE]: The "url" argument must be of type string`.
 * That made the module unimportable in any environment without DATABASE_URL —
 * including tests and this smoke check — so the failure surfaced as a confusing
 * type error rather than "database not configured".
 *
 * With no URI, fall back to the discrete connection arguments; `authenticate()`
 * then produces a clear connection error at startup instead.
 */
const connectionArgs = uri
  ? [uri]
  : [config.database.name || 'securebank', config.database.user || 'postgres', config.database.password || ''];

export const sequelize = new Sequelize(...connectionArgs, {
  dialect: 'postgres',
  logging: config.isProduction ? false : (sql) => logger.debug(sql),
  pool: config.database.pool,
  define: {
    underscored: false,
    freezeTableName: true,
  },
  dialectOptions: {
    // Money must not come back as a lossy JS float. Sequelize returns DECIMAL as
    // strings by default; keep that and convert explicitly in the service layer.
    decimalNumbers: false,
    ssl: config.isProduction ? { require: true, rejectUnauthorized: false } : undefined,
  },
});

/**
 * Assert connectivity. Throws on failure so startup stops instead of serving
 * requests that are guaranteed to fail.
 */
export const testConnection = async () => {
  await sequelize.authenticate();
  logger.info('Database connection established');
  return true;
};

/**
 * Apply the schema.
 *
 * `alter: true` is development-only and off by default: on a ledger it can drop
 * and recreate columns. Production is expected to run migrations.
 */
export const initializeDatabase = async () => {
  await testConnection();

  if (config.database.syncAlter) {
    if (config.isProduction) {
      throw new Error(
        'DB_SYNC_ALTER is enabled in production. Schema changes must go through migrations; ' +
          '`alter: true` can drop or rewrite live columns.'
      );
    }
    logger.warn('Syncing schema with alter:true — development only.');
    await sequelize.sync({ alter: true });
  } else {
    await sequelize.sync();
    logger.info('Schema synchronised');
  }
};

export const closeConnection = async () => {
  await sequelize.close();
  logger.info('Database connection closed');
};

export default sequelize;
