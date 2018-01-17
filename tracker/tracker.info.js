const express = require('express');
const app = express();
const http = require('http');
const infoServer = http.createServer(app);

const INFO_PORT = 4001;
const infoServer = http.createServer(app);

infoServer.listen(INFO_PORT, ADDRESS, () => {
    console.log(`Tracker info server listening on ${ADDRESS}:${INFO_PORT}`);
});