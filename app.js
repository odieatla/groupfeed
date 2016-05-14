"use strict"; // otherwise let, class.. cannot be used

var express = require('express');
var app = express();
var config = require('config');
var passport = require('passport');
var instagramStrategy = require('passport-instagram').Strategy;

global.mongoose = require('mongoose');
mongoose.connect(config.get('db.uri'), (err, res) {
  if (err) {
    console.error(`ERROR connecting to ${config.get('db.uri')}`);
  } else {
    console.error(`Succeeded connected to ${config.get('db.uri')}`);
  }
});

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
/* TODO: finding user by ID when deserializing
  User.findById(obj.id, function (err, user) {
    done(err, user);
  });
*/
});

passport.use(new instagramStrategy({
    clientID: config.get('instagram.client.id'),
    clientSecret: config.get('instagram.client.secret'),
    callbackURL: config.get('instagram.urls.redirect')
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
      console.error(profile);
      
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
app.get('/auth',
  passport.authenticate('instagram', { failureRedirect: '/' }),
  (req, res, next) => {
    res.redirect('/');
});

// first leg of oauth
app.get('/login',
  passport.authenticate('instagram',
    {
      failureRedirect: '/',
      scope: ['comments', 'relationships']
    }),
  (req, res) => {
   
  });

/**
 * api routes
 */
//require('./src/server/routes/index');

app.listen(3000, () => {
  console.log('Example app listening on port 3000');
});
