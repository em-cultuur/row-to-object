/**
 * version 0.2
 * using the Jexl parser for data retrieval
 *
 * example:
 *   fields: {
 *     "id": "customerId",
 *     "type": "'address'",
 *     "fullName" : "(FirstName + ' ' + Insertion) | trim + ' ' + LastName",
 *     "location": {
 *       "street" : "Streetname",
 *       "city" : "=Rotterdam"
 *     }
 *     "name": "column.2 "
 *
 *   }
 *
 */

const Jexl = require('jexl');
// FOR Error bug:
// SHOULD PLACE: https://github.com/TomFrost/Jexl/pull/53/commits/78ced5b4400999165c9f1f39cb89e801fe714d53

Jexl.addTransform('trim', (val) => val.trim());
Jexl.addTransform('ltrim', (val) => val.trimStart());
Jexl.addTransform('rtrim', (val) => val.trimEnd());
Jexl.addTransform( 'length', (val) => val.length);

// case insensitive
Jexl.addBinaryOp('|=|', 20, (a, b) => {
  return typeof a === 'string' && typeof b === 'string'
    ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
    : a === b;
});


// https://stackoverflow.com/questions/2357618/is-there-such-a-thing-as-a-catch-all-key-for-a-javascript-object

class ErrorFieldNotFound extends Error {
  constructor(field, message = false) {
    super(message ? message : `field ${field}`);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.type = 'ErrorFieldNotFound';
    this.fieldname = field
  }
}

// hate globals but the rowLookup keeps dropping the err variable ????
// let lookupErr = false;
let rowLookup = {
  get: function(obj, name) {
    if (obj[name]) {
      return obj[name];
    }
    if (name === 'undefined') {
      return undefined;
    }
    // Jexl parse bug, stop the Error from getting down. So store the error and check at the end
    if (obj.fieldNames[name] === undefined) {
      if (name === 'column') {
        return obj.row;
      }
      throw new ErrorFieldNotFound(name);
//      lookupErr = new ErrorFieldNotFound(name);
//      return undefined;
    }
    return obj.row[obj.fieldNames[name]];
  },
  fieldNames: false,
  row: false,
};


class RowToObject2  {
  constructor(definition = {}) {
    this._didCompile = false;
    this._firstRow = definition.firstRow ? definition.firstRow : 'index';
    if (['fieldName', 'index', 'letter'].indexOf(this._firstRow) < 0) { throw new Error('firstRow can only be fieldName, index or letter')}
    this._fields = definition.fields;
//    this._fieldNames = false;
    this._spaceHandler = definition.spaceHandler ? definition.spaceHandler : 'remove';
    if (['remove', '_'].indexOf(this._spaceHandler) === -1) { throw new Error(`invalid spaceHandler. allowed are remove or _`)}
    this._idField = definition.idField ? definition.idField : 'id';
    this._lookup = new Proxy({}, rowLookup);
    this._emptyCheck = definition.emptyCheck ? definition.emptyCheck : 'length';
    if (['length', 'undefined'].indexOf(this._emptyCheck) === -1) { throw new Error(`invalid emptyCheck. allowed are space or length`)}
  }

  get idField() {
    return this._idField;
  }
  _toColumnName(num) {
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;
  }
  /**
   * retrieve the fieldnames if type = fieldName or letter
   * @param row
   * @private
   */
  _compileRow(row) {
    if (this._didCompile) {
      return true;
    }
    this._didCompile = true;
    let fields = {};
    switch (this._firstRow) {
      case 'index': break;
      case 'fieldName':
        for (let l = 0; l < row.length; l++) {
          let name = this._spaceHandler === '_' ? row[l].replace(' ', '_') : row[l].replace(' ', '');
          fields[name] = l;
        }
        this._lookup.fieldNames = fields;
        return false; // row should not be used
      case 'letter': {
        for (let l = 0; l < row.length; l++) {
          fields[ this._toColumnName(l + 1)] = l;
        }
        this._lookup.fieldNames = fields;
        return true;
      }
    }
  }

  _checkEmpty(value) {
    switch (this._emptyCheck) {
      case 'length' :
        if (value && typeof value === 'string' && value.length > 0) {
          return value;
        } else if (value) { // number
          return value;
        } else {
          return  undefined;
        }
      case 'undefined': return value;
      default:
        throw new Error(`unknown ${this._emptyCheck}`)
    }
  }

  _fieldValue(field) {
    if (typeof field === 'string' || typeof field === 'number') {
      return this._checkEmpty(Jexl.evalSync(field, this._lookup));
    } else if (Array.isArray(field)) {
      let result = [];
      for (let l = 0; l < field.length; l++) {
        let value = this._fieldValue(field[l]);
        if (value !== undefined) {
          result.push(value);
        }
      }
      return result.length ? result : undefined;
    } else { // it's an object
      let result = {};
      for (let fieldName in field) {
        if (!field.hasOwnProperty(fieldName)) { continue };
        let value = this._fieldValue(field[fieldName]);
        if (value !== undefined) {
          result[fieldName] = value;
        }
      }
      // if no values the object is not stored
      return Object.keys(result).length === 0 ? undefined : result;
    }
  }
  /**
   * convert the row into the object
   *
   * @param isFirst Boolean if true it's the first row
   * @param row Array of String the values
   */
  convert(row) {
    if (!this._compileRow(row)) {
      return false
    }
    let result = {};

    this._lookup.row = row;
//    lookupErr = false;
    for (let fieldName in this._fields) {
      if (!this._fields.hasOwnProperty(fieldName)) { continue };
      let value = this._fieldValue(this._fields[fieldName]);
      if (value !== undefined) {
        result[fieldName] = value;
      }
      // if (lookupErr) { // bug in parse makes it invisible here
      //   throw lookupErr
      // }
    }
    return result;
  }
}

module.exports.RowToObject = RowToObject2;