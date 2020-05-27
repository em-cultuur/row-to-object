

const Jexl = require('jexl');
const Moment = require('moment');
const md5 = require('md5');
const Util = require('./util');

// FOR Error bug:
// SHOULD PLACE: https://github.com/TomFrost/Jexl/pull/53/commits/78ced5b4400999165c9f1f39cb89e801fe714d53

Jexl.addTransform('trim', (val) => val.trim());
Jexl.addTransform('ltrim', (val) => val.trimStart());
Jexl.addTransform('rtrim', (val) => val.trimEnd());
Jexl.addTransform( 'length', (val) =>  val && val.length ? val.length : 0);
Jexl.addTransform('date', (val, format) => {
  if (!format) {
    format = ['DD-MM-YYYY', 'YYYY-MM-DD']
  }
  let m = Moment(val, format);
  if (m.isValid()) {
    return Moment(val, format).format();
  } else {
    return undefined;
  }
});
Jexl.addTransform('substr', (val, start, len ) => (typeof val === 'string') ? val.substr(start, len) : val );

Jexl.addTransform('dateAdd', (val, count, period) => {
  if (val) {
    return Moment(val).add(count, period).format();
  }
  return undefined
});
Jexl.addTransform('dateSubract', (val, count, period) => {
  if (val) {
    return Moment(val).subtract(count, period).format();
  }
  return undefined
});

Jexl.addTransform('Object', (val, count, period) => {
  try {
    return JSON.parse(val);
  } catch (e) {
    return undefined
  }
});

Jexl.addTransform('dateFormat', (val, formatStr, lang) => {
  if (val) {
    if (lang) {
      let l = Moment(val);
      if (l.isValid()) {
        l.locale(lang);
        return l.format(formatStr);
      }
    } else {
      let m = Moment(val);
      if (m.isValid()) {
        return m.format(formatStr);
      }
    }
  }
  return undefined;
});

Jexl.addTransform('split', (val, separator, limit) => {
  if (typeof val === 'string') {
    if (val.trim() === '') {
      return  [];
    }
    return val.split(separator, limit).map( (x) => x.trim());
  }
  return val;
});

Jexl.addTransform('nl2br', (val, isXml) => {
  if (typeof val === 'string') {
    var breakTag = (isXml) ? '<br />' : '<br>';
    return (val + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
  }
  return val;
});

Jexl.addTransform('replace', (val, search, replacement) => {
  if (typeof val === 'string') {
    return val.split(search).join(replacement);
  }
  return val;
});

Jexl.addTransform('md5', (val) => {
  if (typeof val === 'string') {
    return md5(val);
  }
  return val;
});

Jexl.addTransform('slot', (val, prefix, postfix) => {
  if (typeof val === 'string') {
    val = val.trim();
  } else if (!val) {
    val = ''
  }
  if (val.length && prefix) {
    val = prefix + val
  }
  if (val.length && postfix) {
    val = val + postfix;
  }
  return val
});

Jexl.addTransform('guid', (val, length = 20) => {
  if (typeof val === 'string') {
    let md = parseInt(md5(val), 16);
    return Util.int36(md).substr(0, length);
  }
  return val;
});


// case insensitive
Jexl.addBinaryOp('|=|', 20, (a, b) => {
  return typeof a === 'string' && typeof b === 'string'
    ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
    : a === b;
});

module.exports = true;
