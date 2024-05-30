const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RetreatSchema = new Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  retreatType: { type: String, required: true },
  language: { type: String, required: true },
});

module.exports = mongoose.model('Retreat', RetreatSchema);
