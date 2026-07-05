const { Pool, Client } = require('pg');

function buildConfig(config = {}) {
  const merged = { ...config };

  if (!merged.ssl && process.env.DB_SSL === 'true') {
    merged.ssl = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
    };
  }

  return merged;
}

function convertPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function transformSql(sql) {
  let text = convertPlaceholders(sql);

  const command = text.trim().split(/\s+/)[0].toUpperCase();

  if (command === 'INSERT' && !/\bRETURNING\b/i.test(text)) {
    text += ' RETURNING *';
  }

  return {
    text,
    command,
  };
}

function extractInsertId(rows = []) {
  const firstRow = rows[0];
  if (!firstRow || typeof firstRow !== 'object') {
    return null;
  }

  const idKey = Object.keys(firstRow).find((key) => key === 'id' || key.endsWith('_id'));
  return idKey ? firstRow[idKey] : null;
}

function normalizeResult(result, command) {
  const rows = result?.rows || [];
  const meta = {
    affectedRows: result?.rowCount || 0,
    insertId: extractInsertId(rows),
    rows,
  };

  if (command === 'SELECT' || command === 'WITH') {
    return [rows, meta];
  }

  return [meta, undefined];
}

async function performQuery(runner, sql, params = []) {
  const { text, command } = transformSql(sql);
  const result = await runner.query(text, params);
  return normalizeResult(result, command);
}

function wrapQueryMethod(runner) {
  return function query(sql, params, callback) {
    const values = Array.isArray(params) ? params : [];
    const cb = typeof params === 'function' ? params : callback;

    if (cb) {
      performQuery(runner, sql, values)
        .then(([primary, secondary]) => cb(null, primary, secondary))
        .catch((error) => cb(error));
      return;
    }

    return performQuery(runner, sql, values);
  };
}

function wrapClient(client, releaseOnEnd = false) {
  const wrapped = {
    query: wrapQueryMethod(client),
    execute: wrapQueryMethod(client),
    beginTransaction(callback) {
      client
        .query('BEGIN')
        .then(() => callback && callback(null))
        .catch((error) => callback && callback(error));
    },
    commit(callback) {
      client
        .query('COMMIT')
        .then(() => callback && callback(null))
        .catch((error) => callback && callback(error));
    },
    rollback(callback) {
      client
        .query('ROLLBACK')
        .then(() => callback && callback())
        .catch((error) => callback && callback(error));
    },
    release() {
      if (typeof client.release === 'function') {
        client.release();
      }
    },
    async end() {
      if (releaseOnEnd && typeof client.end === 'function') {
        await client.end();
        return;
      }

      if (typeof client.release === 'function') {
        client.release();
      }
    },
  };

  wrapped.promise = () => wrapped;

  return wrapped;
}

function createPool(config = {}) {
  const pool = new Pool({
    ...buildConfig(config),
    max: Number(process.env.DB_CONNECTION_LIMIT || 10),
  });

  const wrapped = {
    query: wrapQueryMethod(pool),
    execute: wrapQueryMethod(pool),
    async end() {
      await pool.end();
    },
    getConnection(callback) {
      pool
        .connect()
        .then((client) => callback(null, wrapClient(client)))
        .catch((error) => callback(error));
    },
  };

  wrapped.promise = () => wrapped;

  return wrapped;
}

async function createConnection(config = {}) {
  const client = new Client(buildConfig(config));
  await client.connect();
  return wrapClient(client, true);
}

module.exports = {
  createPool,
  createConnection,
};
