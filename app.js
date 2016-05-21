"use strict"; // otherwise let, class.. cannot be used

var express = require('express');
var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var redisClient = redis.createClient();
var config = require('config');
var passport = require('passport');
var instagramStrategy = require('passport-instagram').Strategy;
var app = express();

var debug = require('debug')('app');
var _ = require('lodash');

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
  done(null, {id: user.id, access_token: user.access_token});
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
    // process.nextTick(cb) runs before any I/O events
    process.nextTick(() => {
      let data = profile._json.data;

      User.findByInstagramId(data.id)
      .then((result) => {
        let user = {
          instagram_id: data.id,
          username: data.username,
          access_token: accessToken,
          full_name: data.full_name || ''
        };

        if (!result) {
          return User.create(user);
        } else {
          return result.updateFields(user);
        }
      })
      .then((user) => {
        if (user) {
          debug(`added user ${user.username} to db`);
        } else {
          debug(`found user ${data.username}`);
        }

        profile.access_token = accessToken;
        return done(null, profile);
      })
      .catch((err) => {
        throw err;
      });
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

var redisStoreConfig = config.get('redis');
redisStoreConfig.client = redisClient;
app.use(session({
  secret: 'groupfeed',
  store: new redisStore(redisStoreConfig),
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// route middleware, cache pageviews
app.use((req, res, next) => {
  debug(`route ${req.path}`);

  if (req.path) {
    redisClient.incr(req.path, (err, reply) => {
      if (err) {
        next(err);
      } else {
        next();
      }
    });
  } else {
    next();
  }
});


app.get('/', (req, res) => {
  res.send('Hello World! And you probably haven\'t login yet.');
});

app.get('/user', ensureAuthenticated, (req, res, next) => {
  User.findByInstagramId(req.session.passport.user.id)
  .then((user) => {
    if (user) {
      let instagram_api = require('./src/server/instagram').use({token_access: user.access_token});
      return instagram_api.follows();
    } else {
      throw new Error('no user found');
    }
  })
  .then((body) => {
    res.send(body);
  })
  .catch((err) => {
    next(err);
  });
});

// second and third leg of oauth
app.get('/auth',
  passport.authenticate('instagram', { failureRedirect: '/' }),
  (req, res, next) => {
    req.session.key = req.session.passport.user.id;
    res.redirect('/user');
  }
);

// first leg of oauth
app.get('/login',
  passport.authenticate('instagram',
  {
    failureRedirect: '/',
    scope: ['comments', 'relationships', 'follower_list']
  }),
  (req, res) => {
    // The request will be redirected to Instagram for authentication, so this
    // function will not be called.
  }
);

app.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if(err) {
      next(err);
    } else {
      res.redirect('/');
    }
  });
});

// error handling middleware must be behind all middlewares and routes calls
app.use((err, req, res, next) => {
  // handle `next(err)` calls
  debug(`ERROR: ${err.message}`);
  debug(err);
});
/**
 * api routes
 */
//require('./src/server/routes/index');

app.listen(3000, () => {
  debug('Example app listening on port 3000');
});
