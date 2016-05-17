'use strict';
var assert = require('chai').assert;
var expect = require('chai').expect;
var config = require('config');
var Instagram = require('../src/server/instagram');
var utils = require('./utils');

describe('Instagram', () => {
  describe('.use', () => {
    it('should take object as param', (done) => {
      expect(Instagram.use('a string')).to.be.not.ok;
      done();
    });

    it('param should have token_access or client_id/client_secret pair', (done) => {
      expect(Instagram.use({})).to.be.not.ok;
      expect(Instagram.use({'token_access': '123'})).to.have.property('get_auth_url');
      expect(Instagram.use({'client_id':'123', 'client_secret': '123'})).to.have.property('get_auth_url');
      done();
    });

    it('instance should have function get_auth_url', (done) => {
      expect(Instagram.use({'token_access': '123'})).to.have.property('get_auth_url');
      expect(Instagram.use({'client_id':'123', 'client_secret': '123'})).to.have.property('get_auth_url');
      expect(Instagram.use({'token_access': '123'})).to.have.property('auth_user');
      expect(Instagram.use({'client_id':'123', 'client_secret': '123'})).to.have.property('auth_user');
      done();
    });

    it('redirect url should be correct', (done) => {
      let redirect_url = 'http://redirect.com';
      let options = {
        client_id: 'c123',
        client_secret: 's123'
      };

      expect(Instagram.use(options).get_auth_url(redirect_url))
        .to.equal(`${config.get('instagram.urls.authorize')}?client_id=${options.client_id}&redirect_uri=${encodeURIComponent(redirect_url)}&response_type=code`);
      done();
    });

  });
});
