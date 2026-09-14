export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'review_reputation',
    synchronize: process.env.DB_SYNCHRONIZE !== 'false',
    logging: process.env.DB_LOGGING === 'true',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-access-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '50', 10),
  },

  ai: {
    provider: (process.env.AI_PROVIDER || 'local') as 'local' | 'http',
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS ?? '120000', 10),
  },

  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@reviewsys.com',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@123',
  },
});