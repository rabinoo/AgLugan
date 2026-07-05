const bcrypt = require('bcrypt');

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

async function comparePassword(inputPassword, storedPassword) {
  if (!storedPassword) {
    return false;
  }

  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(inputPassword, storedPassword);
  }

  // Temporary fallback for legacy plain-text admin rows.
  return inputPassword === storedPassword;
}

async function authenticateCredentials(connection, username, password) {
  const normalizedUsername = username.trim();

  const [adminRows] = await connection.execute(
    'SELECT * FROM admin_users WHERE LOWER(username) = LOWER(?)',
    [normalizedUsername]
  );

  if (adminRows.length > 0) {
    const admin = adminRows[0];
    const passwordMatch = await comparePassword(password, admin.password);

    if (passwordMatch) {
      return {
        kind: 'admin',
        redirectUrl: '/admindashboard',
        session: {
          isAdmin: true,
          adminId: admin.id,
          username: admin.username,
          user_type: 'Admin',
        },
      };
    }

    return null;
  }

  const [userRows] = await connection.execute(
    'SELECT * FROM users WHERE LOWER(username) = LOWER(?)',
    [normalizedUsername]
  );

  if (userRows.length === 0) {
    return null;
  }

  const user = userRows[0];
  const passwordMatch = await comparePassword(password, user.password_hash);

  if (!passwordMatch) {
    return null;
  }

  return {
    kind: 'user',
    redirectUrl: user.user_type === 'Driver' ? '/driverDashboard' : '/passengerDashboard',
    session: {
      user_id: user.user_id,
      username: user.username,
      user_type: user.user_type,
    },
  };
}

function applyLoginSession(req, authResult) {
  req.session.isAdmin = Boolean(authResult.session.isAdmin);
  req.session.adminId = authResult.session.adminId || null;
  req.session.user_id = authResult.session.user_id || null;
  req.session.username = authResult.session.username || null;
  req.session.user_type = authResult.session.user_type || null;
}

module.exports = {
  authenticateCredentials,
  applyLoginSession,
};
