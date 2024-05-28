const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const retreatSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  retreatType: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  }
});

const Retreat = mongoose.model('Retreat', retreatSchema);

module.exports = Retreat;
