const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('../../routes');

// Builds an express app instance with the same middleware and routes
module.exports = function buildApp() {
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(
    helmet({
      contentSecurityPolicy: false,
      frameguard: true
    })
  );
  app.use(cors());
  app.use(routes);
  return app;
};

