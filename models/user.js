const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  profile: {
    bio: String,
    profilePicture: String,
  },
  retreats: [{ type: Schema.Types.ObjectId, ref: 'Retreat' }], // Correct reference to Retreat model
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
