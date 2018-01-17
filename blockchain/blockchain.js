const SHA256 = require('crypto-js/sha256');
const Block = require('./block');

module.exports = class Blockchain {
    constructor() {
        this.miningTimesArray = [];
        this.nonce = 0;
        this.difficulty = 3;
        this.chain = [this.generateGenesisBlock()];
        this.startMiningDate = 0;
        
    }
    generateGenesisBlock() {
        return new Block(
            0, 
            Date.now(),  
            '0000000000000000000000000000000000000000000000000000000000000000', 
            { transactions: [] }, 
            0
        );
    }
    generateBlock(index, timestamp, prevHash, data, nonce) {
        this.chain.push(new Block(index, timestamp,  prevHash, data, nonce));
    }
    
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    getChainLength() {
        return this.chain.length;
    }

    startMining(data) {
        this.nonce = 0;
        this.startMiningDate = Date.now();
        let prevBlock = this.getLatestBlock();
        this.mine(prevBlock, data);
    }
    stopMining() {
        // clearTimeout(this.mineTimer);
    }

    

    mine(prevBlock, newData) {
        let index = this.getChainLength();
        let timestamp = Date.now();
        let prevHash = prevBlock.blockHash;
        let data = newData;
        let nonce = this.nonce;
        let blockHash = SHA256(index + prevHash + timestamp + JSON.stringify(data) + nonce).toString();

        if (blockHash.substring(0, this.difficulty) === Array(this.difficulty + 1).join('0')) {
            this.generateBlock(index, timestamp, prevHash, data, nonce);
            let miningTime = (Date.now() - this.startMiningDate)/1000;
            console.log('HASH:', blockHash);
            console.log('Block mined after', miningTime, 'seconds.');
            this.miningTimesArray.push(miningTime);
            this.startMining({ transactions: [] });

        }
        else {
            this.nonce++;
            setTimeout(this.mine.bind(this, prevBlock, newData), 1);
        }
    }

}








