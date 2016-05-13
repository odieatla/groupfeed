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

passport.use(new instagramStrategy({
    clientID: config.get('instagram.client.id'),
    clientSecret: config.get('instagram.client.secret'),
    callbackURL: config.get('instagram.urls.redirect')
  },
  function(accessToken, refreshToken, profile, done) {
    console.error(profile);
    process.nextTick(function () {
      
      // To keep the example simple, the user's Instagram profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Instagram account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// middlewares
app.use(require('cookie-parser')());
app.use(require('body-parser').json());
app.use(require('express-session')({ secret: 'groupfeed', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


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

  instagram_api.auth_user(access_code, config.get('instagram.urls.redirect'),
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
  res.redirect(instagram_api.get_auth_url(config.get('instagram.urls.redirect')));
});

/**
 * api routes
 */
//require('./src/server/routes/index');

app.listen(3000, function () {
  console.log('Example app listening on port 3000');
});
