const fs = require('fs');
const md5 = require('../../../../utils/helpers/md5.js').md5;

const nftCollectionName = 'PPG';
const version = 'v1';
const nftCount = 8888;
let allHashes = '';

for (let i = 0; i < nftCount; i++) {
  const hash = md5(nftCollectionName + '-' + version + '-' + i.toString());
  allHashes += hash + ',';
}

fs.writeFile(nftCollectionName + '.txt', allHashes, 'utf8', () => { });
