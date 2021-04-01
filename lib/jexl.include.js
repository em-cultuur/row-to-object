

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
/**
 * format Array or string
 *    array - the allowed layouts  the format the data is defined
 *      string - the format
 * returns a string in the first format or in YYYY-MM-DD
 */
Jexl.addTransform('date', (val, format) => {
  if (!format) {
    format = ['YYYY-MM-DD', 'DD-MM-YYYY']
  }
  let m = Moment(val, format);
  if (m.isValid()) {
    if (!Array.isArray(format)) {
      format = [format]
    }
    return m.format(format[0]);
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
Jexl.addTransform('dateSubtract', (val, count, period) => {
  if (val) {
    return Moment(val).subtract(count, period).format();
  }
  return undefined
});

/**
 * convert if needed val into a object when value is a JSON string object
 * @params value String |  Object
 * @params defaultValue | Object returned when the conversion can not be done
 */
Jexl.addTransform('Object', (val, defaultValue = {}) => {
  try {
    if (typeof val === 'string') {
      return JSON.parse(val);
    } else {
      return val;
    }
  } catch (e) {
    return defaultValue
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

Jexl.addTransform('asString', (val) => {
  if (typeof val === 'string') {
    return val
  } else if (val === undefined) {
    return '';
  } else if (typeof val === 'number') {
    return val.toString(10)
  } else if (typeof val === 'boolean') {
    return val ? '1' : '0'
  } else {
    return JSON.stringify(val);
  }
});

Jexl.addTransform('guid', (val, length = 20) => {
  if (typeof val === 'string' || typeof val === 'number') {
    let md = parseInt(md5(val), 16);
    return Util.int36(md).substr(0, length);
  }
  return val;
});

/**
 * get a (default) value from an object / array
 *
 * { name: 'x'} | key('name', 'y') // => x
 * { name: 'x'} | key('not', 'y')  // => y
 * { name: 'x'} | key(['one', 'two', 'name'], 'y') => 'x'
 * { name: 'x'} | key(['one', 'two']) => 'x'
 * 'x' | key('name', 'y') // 'y'
 */

Jexl.addTransform('key', (val, name, defaultValue) => {
  if (typeof val === 'object' && Array.isArray(val) && val.length > 0) {
    if (!Array.isArray(name)) {
      name = [name]
    }
    for (let index = 0; index < name.length; index++) {
      if (name[index] && val[0].hasOwnProperty(name[index])) {
        return val[0][name[index]];
      }
    }
    if (defaultValue === undefined) {
      return val[0]
    }
    return defaultValue
  } else {
    return defaultValue
  }
});

/**
 * start the string with a number of prefix characters
 *
 */
Jexl.addTransform('padStart', (val, count, char = ' ') => {
  switch (typeof val) {
    case 'string':
      return val.padStart(count, char);
    case 'number':
      return val.toString().padStart(count, char);
    case 'boolean':
      return (val ? '1':'0').padStart(count, char);
    default:
      return val;
  }
});

Jexl.addTransform('toUpperCase', (val) => {
  if (typeof val ===  'string') {
    return val.toUpperCase();
  }
  return val;
});
Jexl.addTransform('toLowerCase', (val) => {
  if (typeof val ===  'string') {
    return val.toLowerCase();
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
