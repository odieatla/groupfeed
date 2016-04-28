"use strict"; // otherwise let, class.. cannot be used

var express = require('express');
var app = express();
var config = require('config');
var url = require('url');
var request = require('request');

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

  request.post({
    url: config.get('instagram.urls.token'),
    form: {
      client_id: config.get('instagram.client.id'),
      client_secret: config.get('instagram.client.secret'),
      grant_type: 'authorization_code',
      redirect_uri: 'http://54.186.160.181:3000/auth',
      code: access_code
    }
  }, (err, response, body) => {
    let body_obj = JSON.parse(body);

    // TODO: error handling
    if (err) {
      console.error(err);
    } else if (body && body_obj.access_token) {
      // TODO: save token to cookie? save user info to db?
      console.error(body);
      res.send(body.access_token);
    } else {
      console.error(body);
    }

  });
});

// first leg of oauth
app.get('/login', (req, res) => {
  let url_obj = url.parse(config.get('instagram.urls.authorize'));
  let qs = {
    client_id: config.get('instagram.client.id'),
    redirect_uri: 'http://54.186.160.181:3000/auth',
    response_type: 'code'
  };

  url_obj.query = qs;

  res.redirect(url.format(url_obj));
});

/**
 * api routes
 */
//require('./src/server/routes/index');

app.listen(3000, function () {
  console.log('Example app listening on port 3000');
});
