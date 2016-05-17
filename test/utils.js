'use strict';

const config = require('config');
const mongoose = require('mongoose');

beforeEach((done) => {
  function clearDB() {
    for (let i in mongoose.connection.collections) {
      mongoose.connection.collections[i].remove(() => {});
    }
    return done();
  }

  if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.get('db.uri'), (err) => {
      if (err) {
        throw err;
      }
      return clearDB();
    });
  } else {
    return clearDB();
  }
});

afterEach((done) => {
  mongoose.disconnect();
  return done();
});
