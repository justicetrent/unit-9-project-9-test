'use strict';
// load modules
const express = require('express');
const morgan = require('morgan');
const routes = require('./routes/routes')
const sequelize = require('sequelize')
//create express app 
const app = express();

// create the Express app
// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// const data = require('../seed/data.json')
// const userData = data.user





// setup morgan which gives us http request logging
app.use(morgan('dev'));




// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

