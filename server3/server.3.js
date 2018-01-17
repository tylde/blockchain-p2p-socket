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


let peersList = [];
let connectedPeers = {};
let connectedPeersAddr = {};

// ===== HELPER FUNCTIONS ======================================================================================
class Peer {
    constructor(socketId, socket, address) {
        this.id = socketId;
        this.socket = socket;
        this.address = address;
    }
    send(event, data) {
        if (typeof event !== 'string') {
            console.log('Event is not a string!');
            return false;
        }
        this.socket.emit(event, data);
    }
}


let isConnectedToPeer = (address) => {
    for (let id in connectedPeers) {
        if (connectedPeers[id].address === address) return true;
    }
    return false;
};

let processGottenData = function(data) {
    console.log(data);
}

let clearConnection = function(id, address) {
    delete connectedPeers[id];
    delete connectedPeersAddr[address];
}


// ===== HELPER FUNCTIONS ======================================================================================














// ===== HANDLING CONNECTION FROM ANOTHER SERVER ===============================================================
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
        processGottenData(data);
    });
    socket.on('disconnect', () => {
        console.log('Peer disconnected:', connectedPeers[socket.id].address);
        clearConnection(socket.id, address);
    });
});
// ===== HANDLING CONNECTION FROM ANOTHER SERVER ===============================================================



// ===== HANDLING CONNECTION WITH TRACKER ======================================================================
let tracker = connectionTo.connect('http://localhost:4000', {
    extraHeaders: {
        port: PORT
    }
});
tracker.on('connect', () => {
    console.log('Connected to tracker.');
});
tracker.on('disconnect', () => {
    console.log('Lost connection to Tracker!');
});
tracker.on('add-peer', (data) => {
    peersList.push(data);
});
tracker.on('remove-peer', (data) => {
    let index = peersList.indexOf(data);
    if (index >= 0) peersList.splice(index, 1);
});

tracker.on('peers-list', (data) => {
    peersList = data;
    for (let i = 0; i < peersList.length; i++) {
        let peer = peersList[i];
        if (!isConnectedToPeer(peer) && peer !== ME) {
            // ===== HANDLING CONNECTION TO ANOTHER SERVER =====================================================
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
                processGottenData(data);
            });

            peerConnection.on('disconnect', () => {
                let address = 'localhost:' + peerConnection.io.engine.port;
                let id = connectedPeersAddr[address];
                clearConnection(id, address);
                console.log('Peer disconnected:', address);
            });
            // ===== HANDLING CONNECTION TO ANOTHER SERVER =====================================================
        }
    }
});
// ===== HANDLING CONNECTION WITH TRACKER ======================================================================



// =============================================================================================================
// =============================================================================================================



// ===== MAKING THE WAY TO CHECK SERVER STATUS IN BROWSER ======================================================
app.get('/', (req, res) => {
    let idArr = [];

    for (var id in connectedPeers) {
        let data = '[' + id + '] ' + connectedPeers[id].address;
        idArr.push(data);
    }
    res.json({
        // peersList,
        connectedPeersAddr,
        idArr
    });

});
// ===== MAKING THE WAY TO CHECK SERVER STATUS IN BROWSER ======================================================


