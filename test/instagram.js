'use strict';
var assert = require('chai').assert;
var expect = require('chai').expect;
var config = require('config');
var Instagram = require('../src/server/instagram');

describe('Instagram', function() {
  describe('.use', function() {
    it('should take object as param', function() {
      expect(Instagram.use('a string')).to.be.not.ok;
    });

    it('param should have token_access or client_id/client_secret pair', function() {
      expect(Instagram.use({})).to.be.not.ok;
      expect(Instagram.use({'token_access': '123'})).to.have.property('get_auth_url');
      expect(Instagram.use({'client_id':'123', 'client_secret': '123'})).to.have.property('get_auth_url');
    });

    it('instance should have function get_auth_url', function() {
      expect(Instagram.use({'token_access': '123'})).to.have.property('get_auth_url');
      expect(Instagram.use({'client_id':'123', 'client_secret': '123'})).to.have.property('get_auth_url');
      expect(Instagram.use({'token_access': '123'})).to.have.property('auth_user');
      expect(Instagram.use({'client_id':'123', 'client_secret': '123'})).to.have.property('auth_user');
    });

    it('redirect url should be correct', function() {
      let redirect_url = 'http://redirect.com';
      let options = {
        client_id: 'c123',
        client_secret: 's123'
      };

      expect(Instagram.use(options).get_auth_url(redirect_url))
        .to.equal(`${config.get('instagram.urls.authorize')}?client_id=${options.client_id}&redirect_uri=${encodeURIComponent(redirect_url)}&response_type=code`);
    });

  });
});
