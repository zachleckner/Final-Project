const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const producerSchema = new Schema({
    ssn: { type: String, required: true },
    name: { type: String, required: true }
});

const Producer = mongoose.model('Producer', producerSchema);
module.exports = Producer;

