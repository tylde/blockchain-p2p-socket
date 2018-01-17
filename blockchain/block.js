var SHA256 = require('crypto-js/sha256');

module.exports = class Block {
    constructor(index, timestamp, prevHash, data, nonce) {
        this.index = index;
        this.timestamp = timestamp;
        this.prevHash = prevHash;
        this.data = data

        this.nonce = nonce;
        this.blockHash = this.calculateHash();
    }
    calculateHash() {
        return SHA256(this.index + this.prevHash + this.timestamp + 
            JSON.stringify(this.data) + this.nonce)
            .toString()
    }
}