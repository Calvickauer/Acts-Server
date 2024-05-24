const mongoose = require('mongoose');
const { Schema } = mongoose;

const retreatSchema = new Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    description: String,
});

const Retreat = mongoose.model('Retreat', retreatSchema);
module.exports = Retreat;
