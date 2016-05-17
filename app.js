"use strict"; // otherwise let, class.. cannot be used

var express = require('express');
var app = express();
var config = require('config');
var passport = require('passport');
var instagramStrategy = require('passport-instagram').Strategy;

var debug = require('debug')('app');

global.mongoose = require('mongoose');
mongoose.connect(config.get('db.uri'), (err) => {
  if (err) {
    throw err;
  } else {
    debug(`Succeeded connected to ${config.get('db.uri')}`);
  }
});

var User = require('./src/models/User');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Instagram profile is
//   serialized and deserialized.
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new instagramStrategy({
    clientID: config.get('instagram.client.id'),
    clientSecret: config.get('instagram.client.secret'),
    callbackURL: config.get('instagram.urls.redirect')
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
      User.find({'instagram_id': profile.id}, (err, results) => {
        if (err) {
          throw err;
        }
        if (!results.length) {
          let user = {
            instagram_id: profile.id,
            username: profile.username,
            access_token: accessToken,
            first_name: profile.name.givenName || '',
            last_name: profile.name.familyName || ''
          };
          User.create(user, (err, result) => {
            if (err) {
              throw err;
            } else {
              debug(`added user ${profile.username} to db`);
            }
          })
        } else {
          debug(`found user ${results[0].username}`);
        }
      });
      // To keep the example simple, the user's Instagram profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Instagram account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

// middlewares
app.use(require('cookie-parser')());
app.use(require('body-parser').json());
app.use(require('express-session')({ secret: 'groupfeed', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use((err, req, res, next) => {
  // handle `next(err)` calls
  debug(`ERROR: ${err.message}`);
  debug(err);
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/user', ensureAuthenticated, (req, res) => {
  res.send('logged in');
});

// second and third leg of oauth
app.get('/auth',
  passport.authenticate('instagram', { failureRedirect: '/' }),
  (req, res, next) => {
    res.redirect('/user');
});

// first leg of oauth
app.get('/login',
  passport.authenticate('instagram',
    {
      failureRedirect: '/',
      scope: ['comments', 'relationships']
    }),
  (err, req, res, next) => {
    return next(err);
  });

/**
 * api routes
 */
//require('./src/server/routes/index');

app.listen(3000, () => {
  debug('Example app listening on port 3000');
});
