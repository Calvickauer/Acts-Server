// models/user.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minLength: 8
  },
  date: {
    type: Date,
    default: Date.now
  },
  profile: {
    bio: String,
    profilePicture: String
  },
  retreats: [{ type: Schema.Types.ObjectId, ref: 'Retreat' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
