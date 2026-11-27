const { neon } = require('@neondatabase/serverless');

let cachedSql = null;

/** Returns a Neon tagged-template query function. Always use it with parameters, never string concatenation. */
function getSql() {
  if (cachedSql) return cachedSql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }
  cachedSql = neon(url);
  return cachedSql;
}

module.exports = { getSql };
