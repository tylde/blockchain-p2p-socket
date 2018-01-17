const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const ADDRESS = '127.0.0.1';
const PORT = 5000;

server.listen(PORT, ADDRESS, () => {
    console.log(`Tracker listening on ${ADDRESS}:${PORT}`);
});
app.get('/', (req, res) => {
    res.json(crapcoin);
});

// ======================================================================




const Block = require('./block');
const Blockchain = require('./blockchain');

let crapcoin = new Blockchain();

let data = { transactions: [] }
setTimeout(function() {
    crapcoin.startMining(data);
}, 1000);


