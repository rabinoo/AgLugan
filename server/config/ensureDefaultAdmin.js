const sqlClient = require('./sql-client');
const dbConfig = require('./database');

const DEFAULT_ADMIN_USERNAME = 'Admin';
const DEFAULT_ADMIN_PASSWORD_HASH = '$2b$10$JWVshbB0QiOFssRbxIO7qewhPE/KH4FngfAs5SQugFfK6WVPm9VJm';

async function ensureDefaultAdmin() {
  const connection = await sqlClient.createConnection(dbConfig);

  try {
    const [rows] = await connection.execute(
      'SELECT id, username FROM admin_users WHERE LOWER(username) = LOWER(?)',
      [DEFAULT_ADMIN_USERNAME]
    );

    if (rows.length === 0) {
      await connection.execute(
        'INSERT INTO admin_users (username, password) VALUES (?, ?)',
        [DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD_HASH]
      );
      console.log('Default admin account created.');
      return;
    }

    if (rows[0].username !== DEFAULT_ADMIN_USERNAME) {
      await connection.execute(
        'UPDATE admin_users SET username = ?, password = ? WHERE id = ?',
        [DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD_HASH, rows[0].id]
      );
      console.log('Default admin account normalized.');
      return;
    }

    console.log('Default admin account verified.');
  } catch (error) {
    console.error('Failed to ensure default admin account:', error);
  } finally {
    await connection.end();
  }
}

module.exports = ensureDefaultAdmin;
