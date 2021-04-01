
const Util = require('./lib/util');
const md5 = require('md5');

const from = 0;
const till = 10000;
const length = 15;

console.log(`export id from ${from} till ${till}`)

let r = ''
for (let index = from; index < till; index++) {
  let md = parseInt(md5('' + index), 16);
  let result = Util.int36(md).substr(0, length);
  let line = `${index}',"${result}"`
  r += line +'\n';
  console.log(line)
}

console.log(r)
