var express = require('express');
var app = express();
var config = require('config');
var request = require('request');

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.get('/login', (req, res) => {
  request.get({
    url: config.get('instagram.urls.oauth'),
    qs: {
      client_id: config.get('instagram.client.id'),
      redirect_uri: 'http://54.186.160.181:3000/',
      response_type: 'code'
    }
  },
  (error, message, response) => {
    console.error(response);
    res.send(response);
  });
});

/**
 * api routes
 */
//require('./src/server/routes/index');

app.listen(3000, function () {
  console.log('Example app listening on port 3000');
});
