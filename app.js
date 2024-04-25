const express = require('express');
const mongoose = require('mongoose');
const producer = require('./handlers/producerRouter');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost:27017/myDatabase');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const Producer = require('./models/Producer');
const Timeslot = require('./models/Timeslot');

// Manger
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

app.get('/logout', function (req, res) {
  res.clearCookie('loggedInProducer');
  res.redirect('/MainPage');
});

app.get('/MainPage', function (req, res) {
  const loggedInProducer = req.cookies.loggedInProducer;
  res.render('pages/MainPage', { loggedInProducer });
});

app.get('/Producer', (req, res) => {
  const loggedInProducerSSN = req.cookies.loggedInProducer;
  res.render('pages/Producer', { ssn: loggedInProducerSSN });
});

app.get('/Producer2', (req, res) => {
  const loggedInProducerSSN = req.cookies.loggedInProducer;
  res.render('pages/Producer2', { loggedInProducerSSN });
});

app.get('/Producer2', (req, res) => {
  const ssn = req.query.ssn;
  res.render('pages/Producer2', { ssn });
});

app.post('/MainPage/login', async (req, res) => {
  const ssn = req.body.ssn;
  await Producer.findOne({ ssn });
  res.cookie('loggedInProducer', ssn);
  res.redirect('/MainPage');
});

app.get('/', function (req, res) {
  res.redirect('/MainPage');
});

app.get('/MainPage', function (req, res) {
  res.render('pages/MainPage');
});

app.get('/Producer', function (req, res) {
  res.render('pages/Producer');
});

app.get('/Producer2', function (req, res) {
  res.render('pages/Producer2');
});

app.get('/Manager', function (req, res) {
  res.render('pages/Manager');
});

app.use('/', producer);

app.get('/timeslots', async (req, res) => {
  const { producerSSN, djSSN } = req.query;

  try {
    const timeslots = await Timeslot.find({ pssn: producerSSN, dssn: djSSN });
    res.json({ success: true, timeslots });
  } catch (error) {
    console.error('Error fetching timeslots:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/updateTimeslot/:timeslotId', async (req, res) => {
  const { timeslotId } = req.params;
  const { date, start, end, producerSSN, djSSN } = req.body;

  try {
    const updatedTimeslot = await Timeslot.findOneAndUpdate(
      { id: timeslotId, pssn: producerSSN, dssn: djSSN },
      { date, start, end },
      { new: true }
    );
    if (updatedTimeslot) {
      res.json({ success: true, message: 'Timeslot updated successfully', updatedTimeslot });
    } else {
      res.status(404).json({ success: false, message: 'Timeslot not found' });
    }
  } catch (error) {
    console.error('Failed to update timeslot:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



app.post('/addTimeslot', async (req, res) => {
  const { producerSSN, djSSN, date, start, end } = req.body;

  try {
    // Generate a new unique ID for the timeslot
    const lastTimeslot = await Timeslot.findOne().sort({ _id: -1 });
    const lastId = lastTimeslot ? parseInt(lastTimeslot.id.slice(1)) : 0;
    const newId = `T${(lastId + 1).toString().padStart(3, '0')}`;

    const newTimeslot = new Timeslot({
      id: newId,
      date,
      start,
      end,
      psongs: [],
      dsongs: [],
      dssn: djSSN,
      pssn: producerSSN
    });

    await newTimeslot.save();
    res.status(201).json({ success: true, message: 'Timeslot added successfully' });
  } catch (error) {
    console.error('Error adding timeslot:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});