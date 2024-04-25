const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Manager schema
const managerSchema = new Schema({
  ssn: { type: String, required: true},
  name: { type: String, required: true }
});

const Manager = mongoose.model('Manager', managerSchema);

module.exports = Manager;
