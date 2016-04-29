"use strict"; // otherwise let, class.. cannot be used

var express = require('express');
var app = express();
//var instagram_api = require('./src/server/instagram');
var config = require('config');
//var url = require('url');
//var request = require('request');


var instagram_api = require('./src/server/instagram').use({
  client_id: config.get('instagram.client.id'),
  client_secret: config.get('instagram.client.secret')
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// second and third leg of oauth
app.get('/auth', (req, res, next) => {
  let query = req.query;

  if (query.error && query.error_reason === 'user_denied') {
    console.error('user denied');
    res.send('Too bad. User denied.');
    return next();
  }

  let access_code = query.code;

  instagram_api.auth_user(access_code, 'http://54.186.160.181:3000/auth',
    (err, response, body) => {
      if (err) {
        console.error(err);
      } else if (body && body.access_token) {
        // TODO: save token to cookie? save user info to db?
        res.send(body.access_token);
      } else {
        console.error(body);
      }
  });

});

// first leg of oauth
app.get('/login', (req, res) => {
  res.redirect(instagram_api.get_auth_url('http://54.186.160.181:3000/auth'));
});

/**
 * api routes
 */
//require('./src/server/routes/index');

app.listen(3000, function () {
  console.log('Example app listening on port 3000');
});
