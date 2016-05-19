'use strict';
var config = require('config');
var url = require('url');
var request = require('request-promise');

/**
 * sign in request to use: access_key or client_id/client_secret pair
 * @param options object { access_key } || { client_id, client_secret }
 * @return instance with instagram api functions
 */
exports.use = function ig_use(options) {
  let ret = null;
  if (typeof options === 'object') {
    let attrs = {};
    if (options.token_access) {
      attrs.auth = {
        access_token: options.token_access
      };

      if (options.client_secret) {
        attrs.auth.client_secret = options.client_secret;
      }

      return new Instagram(attrs);
    } else if (options.client_id && options.client_secret) {
      attrs.auth = {
        client_id: options.client_id,
        client_secret: options.client_secret
      };

      ret = new Instagram(attrs);
    } else {
      console.error('wrong params for use in instagram');
    }
  } else {
    console.error('options for use in instagram should be object');
  }

  return ret;
};


var Instagram = function(attrs) {
  this.attrs = attrs;
};


/**
 * Get authentication url -- first step of logging in a user
 * @param redirect_url string the redirected url that registered with Instagram API
 * @return authentication_url string the url a user will use to log in and authorize the app
 */
Instagram.prototype.get_auth_url = function(redirect_url, scope) {
  let url_obj = url.parse(config.get('instagram.urls.authorize'));
  let qs = {
    client_id: this.attrs.auth.client_id,
    redirect_uri: redirect_url,
    response_type: 'code'
  };

  if (Array.isArray(scope)) {
    qs.scope = scope.join('+');
  }

  url_obj.query = qs;

  return url.format(url_obj);
};


/**
 * Last steps of logging in a user
 * @param code string received after redirected from get_auth_url
 * @param redirect_url string the redirected url that registered with Instagram API
 * @param cb function(err, response, body)
 */
Instagram.prototype.auth_user = function(code, redirect_url, cb) {
  request.post({
    url: config.get('instagram.urls.token'),
    form: {
      client_id: this.attrs.auth.client_id,
      client_secret: this.attrs.auth.client_secret,
      grant_type: 'authorization_code',
      redirect_uri: redirect_url,
      code: code
    }
  })
  .then((response, body) => {
    let body_obj = JSON.parse(body);

    if (body && body_obj.access_token) {
      return new Promise((resolve, reject) => {
        resolve(response, body_obj);
      });
    } else {
      return new Promise((resolve, reject) => {});
    }
  })
  .catch((err) => {
    console.error(err);
  });
};

/**
 * Get the list of users this user follows
 * return the list of users this user follows
 */
Instagram.prototype.follows = function(token) {
  let access_token = token ? token : this.attrs.auth.access_token;

  let options = {
    uri: `${config.get('instagram.urls.base')}users/self/follows`,
    qs: {
      access_token: token ? token : this.attrs.auth.access_token
    },
    json: true
  };

  return request(options);
};
