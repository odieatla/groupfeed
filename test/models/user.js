'use strict';

var mongoose = require('mongoose');
var expect = require('chai').expect;
var utils = require('../utils');
var User = require('../../src/models/User');

describe('User', () => {
  let curUser = null;
  beforeEach((done) => {
    User.create({
      instagram_id: '123',
      username: 'username',
      access_token: 'accesstoken'
    }, (user) => {
      curUser = user;
      done();
    });
  });

  // tests
  it('creates a new user', (done) => {
    User.create({
      instagram_id: '234',
      username: 'username2',
      access_token: 'accesstoken2'
    }, (err, user) => {
      expect(err).to.not.exist;
      expect(user.username).to.equal('username2');
      done();
    });
  });

  it('should not create a user with duplicated instagram id', (done) => {
    User.create({
      instagram_id: '123',
      username: 'username3',
      access_token: 'accesstoken3'
    }, (err, user) => {
      console.error(err);
      expect(err.code).to.equal(11000);
      done();
    });
  });

  it('should not create a user with duplicated username', (done) => {
    User.create({
      instagram_id: '1234',
      username: 'username',
      access_token: 'accesstoken3'
    }, (err, user) => {
      console.error(err);
      expect(err.code).to.equal(11000);
      done();
    });
  });

  it('should find user by instagram id', (done) => {
    User.findByInstagramId(123)
    .then((user) => {
      expect(user).to.exist;
    });

    done();
  });

  it('should update user\'s full_name', (done) => {
    User.findByInstagramId(123)
    .then((user) => {
      return user.updateFields({full_name: 'insta123'})
    })
    .then((ret) => {
      expect(ret.full_name).to.be.equal('insta123');
    });

    done();
  });
});
