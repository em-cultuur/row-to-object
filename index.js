const row2obj1 = require('./row-to-object-1');
const row2obj2 = require('./row-to-object-2');

module.exports = {
  RowToObject: row2obj1.RowToObject,
  ErrorFieldNotFound : row2obj1.ErrorFieldNotFound,
  charToIndex: row2obj1.charToIndex(),

  RowToObject2: row2obj2
};