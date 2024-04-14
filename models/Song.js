const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: Number, required: true }
});

const Song = mongoose.model('Song', songSchema);
module.exports = Song;