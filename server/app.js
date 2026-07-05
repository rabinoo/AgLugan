const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const path = require('path');
const cors = require('cors');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const loginRoute = require('./routes/loginRoute');
const resetPasswordRoute = require('./routes/reset_password_route');
const forgotPasswordRoute = require('./routes/forgot_password_route');
const checkSessionRoute = require('./routes/check_session_route');
const passengerDashboardRoute = require('./routes/passenger_dashboard_route');
const updateProfileRoute = require('./routes/update_profile_route');
const changePasswordRoute = require('./routes/change_password_route');
const logoutRoute = require('./routes/logout_route');
const registerRoute = require('./routes/register_route');
const checkUniqueRoute = require('./routes/check_unique_route');
const getRidesRoute = require('./routes/get_rides_route');
const updateRideStatusRoute = require('./routes/update_ride_status_route');
const paymentAmountRoute = require('./routes/payment_amount_route');
const processPaymentRoute = require('./routes/process_payment_route');
const driverDashboardRoute = require('./routes/driver_dashboard_route');
const adminLoginRoute = require('./routes/admin_login_route');
const getUsersRoute = require('./routes/get_users_route');
const adminDashboardRoute = require('./routes/admin_dashboard_route');
const bookingRoutes = require('./routes/book_ride_route');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: 'aglugan-session',
    keys: [process.env.SESSION_SECRET || 'change-this-session-secret'],
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
  })
);

app.use((req, res, next) => {
  if (!req.session) {
    req.session = {};
  }

  req.session.destroy = (callback) => {
    req.session = null;
    if (typeof callback === 'function') {
      callback();
    }
  };

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

app.use(express.static(path.join(__dirname, '..', 'client', 'public')));
app.use(express.static(path.join(__dirname, '..', 'client', 'src')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use('/api', forgotPasswordRoute);
app.use('/api', resetPasswordRoute);
app.use('/api', loginRoute);
app.use('/api', logoutRoute);
app.use('/api', checkSessionRoute);
app.use('/api', passengerDashboardRoute);
app.use('/api', updateProfileRoute);
app.use('/api', changePasswordRoute);
app.use('/api', registerRoute);
app.use('/api', checkUniqueRoute);
app.use('/api', getRidesRoute);
app.use('/api', updateRideStatusRoute);
app.use('/api', paymentAmountRoute);
app.use('/api', processPaymentRoute);
app.use('/api', driverDashboardRoute);
app.use('/api', adminLoginRoute);
app.use('/api', getUsersRoute);
app.use('/api', adminDashboardRoute);
app.use('/api/admin-dashboard', adminDashboardRoute);
app.use('/', bookingRoutes);

const htmlRoutes = {
  '/': 'index.html',
  '/login': 'login.html',
  '/schedule': 'schedule.html',
  '/aboutUs': 'aboutUsPage.html',
  '/driverDashboard': 'driver-dashboard.html',
  '/driverQueue': 'driver-queue.html',
  '/payment': 'paymentPage.html',
  '/register': 'register.html',
  '/resetPassword': 'reset_password.html',
  '/passengerDashboard': 'passenger-dashboard.html',
  '/driverStats': 'driver-statistics.html',
  '/adminlogin': 'admin-login.html',
  '/admindashboard': 'admin-dashboard.html',
};

Object.entries(htmlRoutes).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'src', 'html', file));
  });
});

app.use((req, res) => {
  console.log('404 error for:', req.url);
  res.status(404).send('Resource not found');
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    status: 'error',
    message: isProduction ? 'Internal server error' : err.message,
  });
});

module.exports = app;
