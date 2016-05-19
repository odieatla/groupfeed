'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('lodash');

const UserSchema = mongoose.Schema({
  instagram_id: { type: Number, required: true, index: { unique: true }},
  username: { type: String, required: true, index: { unique: true }},
  access_token: { type: String, required: true },
  full_name: String
});

UserSchema.methods.updateFields = function(fieldObj) {
  let changed = false;
  _.each(fieldObj, (v, key) => {
    if (this[key] !== v) {
      this[key] = v;
      changed = true;
    }
  });

  return changed ? this.save(): new Promise((resolve) => {resolve();});
};

UserSchema.statics.findByInstagramId = function(instagramId) {
  return this.findOne({instagram_id: instagramId}).exec();
};

module.exports = mongoose.model('User', UserSchema);
