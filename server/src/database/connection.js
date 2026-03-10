import { Sequelize } from 'sequelize';
import config from '@/config';

/**
 * Initialize Sequelize connection
 */
export const sequelize = new Sequelize(
  config.database.url || `postgresql://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.name}`,
  {
    dialect: 'postgres',
    logging: config.env === 'development' ? console.log : false,
    pool: {
      max: config.database.pool.max,
      min: config.database.pool.min,
      acquire: config.database.pool.acquire,
      idle: config.database.pool.idle,
    },
  }
);

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

/**
 * Initialize database
 */
export const initializeDatabase = async () => {
  try {
    await sequelize.sync({ 
      alter: config.env === 'development',
      force: false 
    });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Database synchronization failed:', error);
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeConnection = async () => {
  await sequelize.close();
  console.log('Database connection closed.');
};

export default sequelize;
