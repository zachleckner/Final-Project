const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeslotSchema = new Schema({
    id: { type: String, required: true },
    date: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    psongs: [{ type: String, required: true }], // Array of song IDs for producer's songs
    dsongs: [{ type: String, required: true }], // Array of song IDs for DJ's songs
    dssn: { type: String, required: true }, // Assuming dssn is DJ's SSN
    pssn: { type: String, required: true } // Assuming pssn is producer's SSN
});

const Timeslot = mongoose.model('Timeslot', timeslotSchema);
module.exports = Timeslot;