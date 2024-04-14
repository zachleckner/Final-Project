const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
    songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    dssn: { type: String, required: true } // Assuming dssn is DJ's SSN
});

const Playlist = mongoose.model('Playlist', playlistSchema);
module.exports = Playlist;