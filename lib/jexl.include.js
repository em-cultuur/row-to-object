

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
  return Moment(val, format).format();
});

Jexl.addTransform('dateAdd', (val, count, period) => {
  return Moment(val).add(count, period).format();
});
Jexl.addTransform('dateSubract', (val, count, period) => {
  return Moment(val).subtract(count, period).format();
});

Jexl.addTransform('dateFormat', (val, formatStr, lang) => {
  if (lang) {
    let l = Moment(val);
    l.locale(lang);
    return l.format(formatStr);
  }
  return Moment(val).format(formatStr);
});

// case insensitive
Jexl.addBinaryOp('|=|', 20, (a, b) => {
  return typeof a === 'string' && typeof b === 'string'
    ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
    : a === b;
});

module.exports = true;
