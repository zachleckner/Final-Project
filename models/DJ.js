const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const djSchema = new Schema({
    ssn: { type: String, required: true },
    name: { type: String, required: true },
    pssn: { type: String, required: true } // Assuming pssn stands for Producer's SSN
});

const DJ = mongoose.model('DJ', djSchema);
module.exports = DJ;