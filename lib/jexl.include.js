

const Jexl = require('jexl');
const Moment = require('moment');

// FOR Error bug:
// SHOULD PLACE: https://github.com/TomFrost/Jexl/pull/53/commits/78ced5b4400999165c9f1f39cb89e801fe714d53

Jexl.addTransform('trim', (val) => val.trim());
Jexl.addTransform('ltrim', (val) => val.trimStart());
Jexl.addTransform('rtrim', (val) => val.trimEnd());
Jexl.addTransform( 'length', (val) => val.length);
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
})

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

// case insensitive
Jexl.addBinaryOp('|=|', 20, (a, b) => {
  return typeof a === 'string' && typeof b === 'string'
    ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
    : a === b;
});

module.exports = true;
