const express = require('express');
const app = express();
const http = require('http');
const tracker = http.createServer(app);
const io = require('socket.io')(tracker);

const ADDRESS = 'localhost';
const PORT = 4000;

class Peer {
    constructor(socketId, socket, address) {
        this.id = socketId;
        this.socket = socket;
        this.address = address;
    }
}

let clients = {};
let peersList = [];

tracker.listen(PORT, ADDRESS, () => {
    console.log(`Tracker listening on ${ADDRESS}:${PORT}`);
});


io.on('connection', (socket) => {
    // ===== NEW CONNECTION =========================================
    let port = socket.handshake.headers.port;
    let address = `localhost:${port}`;
    clients[socket.id] = new Peer(socket.id, socket, address);
    peersList.push(address);
    console.log(`New connection from: ${address}`);

    socket.broadcast.emit('add-peer', clients[socket.id].address);
    socket.emit('peers-list', peersList);
    // ===== NEW CONNECTION =========================================




    socket.on('disconnect', () => {
        console.log('Peer disconnected:', clients[socket.id].address);
        
        let index = peersList.indexOf(clients[socket.id].address);
        if (index >= 0) peersList.splice(index, 1);
        
        socket.broadcast.emit('remove-peer', clients[socket.id].address);
        delete clients[socket.id];
    });



});

// setInterval(() => {
//     console.log(io.clients());
// }, 1000)


app.get('/', (req, res) => {
    res.json(peersList);
});













