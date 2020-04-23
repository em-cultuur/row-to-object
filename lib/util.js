

const int36 = (val) => {
  if (val === undefined) {
    return undefined;
  }
  let elm = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (val < elm.length) {
    return elm[val];
  } else {
    return int36(Math.floor(val / elm.length)).toString() + int36(val % elm.length).toString();
  }
}


module.exports.int36 = int36;
