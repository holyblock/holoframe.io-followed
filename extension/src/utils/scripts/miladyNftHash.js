const fs = require('fs');
const md5 = require('../md5.js').md5;

const nftCollectionName = 'MIL';
const version = 'v1';
const nftCount = 10006;
let allHashes = '';

for (let i = 0; i < nftCount; i++) {
  const hash = md5(nftCollectionName + '-' + version + '-' + i.toString());
  allHashes += hash + ',';
}

fs.writeFile(nftCollectionName + '.txt', allHashes, 'utf8', () => { });
