const express = require('express');
const router = express.Router();
const Producer = require('../models/Producer');
const DJ = require('../models/DJ');

router.get('/producers', async (req, res) => {
    try {
        const producers = await Producer.find();
        res.render('managerProducersList', { producers }); // Assuming you have an EJS template named managerProducersList
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

router.get('/Manager', async (req, res) => {
    const producerSSN = req.query.ssn;
    if (!producerSSN) {
        return res.status(400).send("No SSN provided");
    }
    
    try {
        const producer = await Producer.findOne({ ssn: producerSSN });
        if (!producer) {
            return res.status(404).send("Producer not found");
        }
        
        const djs = await DJ.find({ pssn: producerSSN });
        res.render('producerDJsList', { producer, djs });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

router.get('/djs/:ssn', async (req, res) => {
    try {
        const djs = await DJ.find({ pssn: req.params.ssn });
        res.json({ djs });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
});

router.get('/timeslots/:ssn', async (req, res) => {
    try {
        const timeslots = await Timeslot.find({ dssn: req.params.ssn }); // Assuming you have a field in Timeslot for DJ SSN
        res.json({ timeslots });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
});


module.exports = router;
