const express = require('express');
const router = express.Router();
const Producer = require('../models/Producer');
const DJ = require('../models/DJ');
const Timeslot = require('../models/Timeslot');
const Song = require('../models/Song');

router.get('/producers', async (req, res) => {
    const producers = await Producer.find();
    res.json({ producers });
});

router.get('/djs/:pssn', async (req, res) => {
    const { pssn } = req.params;
    const djs = await DJ.find({ pssn });
    res.json({ djs });
});

router.get('/timeslots/:pssn/:dssn', async (req, res) => {
    const { pssn, dssn } = req.params;
    const timeslots = await Timeslot.find({ $and: [{ pssn }, { dssn }] }).populate('psongs dsongs');
    res.json({ timeslots });
});

router.get('/songs/:ids', async (req, res) => {
    const { ids } = req.params;
    const songIds = ids.split(',');
    let songs = [];
    for (const id of songIds) {
        const song = await Song.findOne({ id });
        if (song) {
            songs.push(song);
        }
    }
    res.json({ songs });
});

router.get('/songs', async (req, res) => {
    const allSongs = await Song.find();
    res.json({ songs: allSongs });
});

router.post('/timeslots/:id/psongs', async (req, res) => {
    const { id } = req.params;
    const { songId } = req.body;
    const timeslot = await Timeslot.findById(id);
    timeslot.psongs.push(songId);
    await timeslot.save();
    res.json({ message: 'Song added to psongs successfully' });
});

router.put('/timeslots/:id/psongs/:index', async (req, res) => {
    const { id, index } = req.params;
    const timeslot = await Timeslot.findOne({ id: id });
    timeslot.psongs.splice(index, 1);
    await timeslot.save();
    res.json({ message: 'Song removed from psongs array' });
});

router.get('/timeslots/:id', async (req, res) => {
    const { id } = req.params;
    const timeslot = await Timeslot.findOne({ id });
    res.json({ timeslot });
});

router.get('/songs/:id', async (req, res) => {
    const { id } = req.params;
    const song = await Song.findOne({ id });
    res.json({ song });
});

router.put('/timeslots/:id/psongs/:index/:songId', async (req, res) => {
    const { id, index, songId } = req.params;
    const timeslot = await Timeslot.findOne({ id });
    if (index === timeslot.psongs.length) {
        const song = await Song.findById(songId);
        timeslot.psongs.push(songId);
    } else {
        timeslot.psongs[index] = songId;
    }
    await timeslot.save();
    res.json({ timeslot });
});

module.exports = router;
