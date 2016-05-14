'use strict';

const UserSchema = mongoose.Schema({
  instgram_id: { type: Number, required: true },
  username: { type: String, required: true, index: { unique: true },
  first_name: String,
  last_name: String,
  access_token: { type: String, required: true }
});

module.exports = mongoose.model('User', UserSchema);
