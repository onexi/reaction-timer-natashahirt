const express = require('express');
const path = require('path');
const escape = require('escape-html');
const app = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(__dirname));

// data storage
let reactionTimes = []; // array to store reaction times on the server

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// receive reaction times from html site
app.post('/save-reaction-time', (req, res) => {
    const reactionTime = req.body.time;
    if (reactionTime) {
        reactionTimes.push(reactionTime);
        res.json({ status: 'success', time: reactionTime });
    } else {
        res.status(400).json({ status: 'error', message: 'Invalid data' });
    }
});

// send reaction times back to site
app.get('/retrieve-reaction-times', (req, res) => {
    res.json({ times: reactionTimes });
});

// clear reaction times on page reload
app.post('/clear-reaction-times', (req, res) => {
    reactionTimes = []; // reset the array
    res.json({ status: 'success', message: 'Reaction times cleared' });
});

// connect to port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});