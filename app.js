const express = require('express');
const mongoose = require('mongoose');
const producer = require('./handlers/producerRouter'); 
const cookieParser = require('cookie-parser');
mongoose.connect('mongodb+srv://zachleckner:1158@cluster0.0fdmdby.mongodb.net/');
const app = express();
app.use(express.urlencoded({ extended: true }));
const Producer = require('./models/Producer');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser()); 

app.get('/logout', function(req, res) {
    res.clearCookie('loggedInProducer');
    res.redirect('/MainPage');
});

app.get('/MainPage', function(req, res) {
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

app.get('/', function(req, res) {
    res.redirect('/MainPage');
});

app.get('/MainPage', function(req, res) {
    res.render('pages/MainPage');
});

app.get('/Producer', function(req, res) {
    res.render('pages/Producer');
});

app.get('/Producer2', function(req, res) {
    res.render('pages/Producer2');
});

app.use('/', producer);

app.listen(3000)
