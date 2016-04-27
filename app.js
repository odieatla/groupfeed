"use strict"; // otherwise let, class.. cannot be used

var express = require('express');
var app = express();
var config = require('config');
var url = require('url');
//var request = require('request');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// second and third leg of oauth
app.get('/auth', (req, res) => {
  let access_code = req.query.code;

  request.post({
    url: config.get('instagram.urls.token'),
    form: {
      client_id: config.get('instagram.client.id'),
      grant_type: authorization_code,
      redirect_uri: 'http://54.186.160.181:3000/auth',
      code: access_code
    }
  }, (err, result, remaining, limit) => {
    res.send(result.access_token);
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
