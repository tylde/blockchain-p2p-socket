const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);



const ADDRESS = '127.0.0.1';
const PORT = 4000;

let clients = {};

server.listen(PORT, ADDRESS, () => {
    console.log(`Tracker listening on ${ADDRESS}:${PORT}`);
});


















const INFO_PORT = 4001;
const infoServer = http.createServer(app);

infoServer.listen(INFO_PORT, ADDRESS, () => {
    console.log(`Tracker info server listening on ${ADDRESS}:${INFO_PORT}`);
});

