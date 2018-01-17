const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const connectionFrom = require('socket.io')(server);
const connectionTo = require('socket.io-client');

const config = require('./config');

const ADDRESS = config.address;
const PORT = config.port;
const ME = config.ip;

class Peer {
    constructor(socketId, socket, address) {
        this.id = socketId;
        this.socket = socket;
        this.address = address;
    }
}

let peersList = [];
let connectedPeers = {};
let connectedPeersAddr = {};


server.listen(PORT, ADDRESS, () => {
    console.log(`Peer listening on ${ADDRESS}:${PORT}`);
});

connectionFrom.on('connection', (socket) => {
    let port = socket.handshake.headers.port;
    let address = `localhost:${port}`;
    console.log(`Connected with: ${address}`);

    connectedPeers[socket.id] = new Peer(socket.id, socket, address);

    connectedPeersAddr[address] = socket.id;

    socket.on('data', (data) => {
        console.log('FROM', data);
    });

    socket.on('disconnect', () => {
        console.log('Peer disconnected:', connectedPeers[socket.id].address);
    
        
        delete connectedPeersAddr[address];
        delete connectedPeers[socket.id];

    });
});












let isConnectedToPeer = (address) => {
    for (let id in connectedPeers) {
        if (connectedPeers[id].address === address) return true;
    }
    return false
};


let tracker = connectionTo.connect('http://localhost:4000', {
    extraHeaders: {
        port: PORT
    }
});
tracker.on('connect', () => {
    console.log('Connected to tracker.');
});
tracker.on('connect_failed', (err) => {
    console.log('KAPPA:', err);
});
tracker.on('error', (err) => {
    console.log(err);
});
tracker.on('disconnect', () => {
    console.log('Lost connection to Tracker!');
});

tracker.on('peers-list', (data) => {
    peersList = data;
    for (let i = 0; i < peersList.length; i++) {
        let peer = peersList[i];
        if (!isConnectedToPeer(peer) && peer !== ME) {
            console.log(`Connecting to peer: ${peer}...`);
            let peerConnection = connectionTo.connect('http://' + peer, {
                extraHeaders: {
                    port: PORT
                },
                reconnection: false
            });
            peerConnection.on('connect', () => {
                let port = peerConnection.io.engine.port
                let address = `localhost:${port}`;
                connectedPeers[peerConnection.id] = new Peer(peerConnection.id, peerConnection, address);
                connectedPeersAddr[address] = peerConnection.id;

                console.log(`Connected to peer: ${address}`);
            });
            peerConnection.on('data', (data) => {
                console.log('TO', data);
            });

            peerConnection.on('disconnect', () => {
                let address = 'localhost:' + peerConnection.io.engine.port;
                let id = connectedPeersAddr[address];

                console.log('Peer disconnected:', address);
                
                delete connectedPeers[id];
                delete connectedPeersAddr[address];

            });
        }
    }

});

tracker.on('add-peer', (data) => {
    console.log('New peer!');
    peersList.push(data);

});

tracker.on('remove-peer', (data) => {
    let index = peersList.indexOf(data);
    if (index >= 0) peersList.splice(index, 1);
    console.log(`Remove peer: ${data}`);
});






app.get('/', (req, res) => {
    let idArr = [];

    for (var id in connectedPeers) {
        let data = '[' + id + '] ' + connectedPeers[id].address;
        idArr.push(data);
    }
    res.json({
        peersList,
        connectedPeersAddr,
        idArr
    });

});

setInterval(() => {
    for (let id in connectedPeers) {
        connectedPeers[id].socket.emit('data', { test: 'kappa' });
        console.log('Sent data to:', connectedPeers[id].address);
    }
}, 10000)


