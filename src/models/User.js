'use strict';

const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  instagram_id: { type: Number, required: true, index: { unique: true }},
  username: { type: String, required: true, index: { unique: true }},
  access_token: { type: String, required: true },
  first_name: String,
  last_name: String
});

module.exports = mongoose.model('User', UserSchema);
