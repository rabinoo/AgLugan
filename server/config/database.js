const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '';

if (databaseUrl) {
  module.exports = {
    connectionString: databaseUrl,
    ssl:
      process.env.DB_SSL === 'false'
        ? false
        : {
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
          },
  };
} else {
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aglugan',
  };

  if (process.env.DB_SSL === 'true') {
    dbConfig.ssl = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
    };
  }

  module.exports = dbConfig;
}
