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
 *
 *   }
 *
 */

const Jexl = require('jexl');

Jexl.addTransform('trim', (val) => val.trim());
Jexl.addTransform('ltrim', (val) => val.trimStart());
Jexl.addTransform('rtrim', (val) => val.trimEnd());

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
let lookupErr = false;
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
      lookupErr = new ErrorFieldNotFound(name);
      return undefined;
    }
    return obj.row[obj.fieldNames[name]];
  },
  fieldNames: false,
  row: false,
};


class RowToObject2  {
  constructor(definition = {}) {
    this._firstRow = definition.firstRow ? definition.firstRow : 'index';
    if (['fieldName', 'index', 'letter'].indexOf(this._firstRow) < 0) { throw new Error('firstRow can only be fieldName, index or letters')}
    this._fields = definition.fields;
    this._fieldNames = false;
    this._idField = definition.idField ? definition.idField : 'id';
    this._lookup = new Proxy({}, rowLookup)
  }

  /**
   * retrieve the fieldnames if type = fieldName or letter
   * @param row
   * @private
   */
  _compileRow(row) {
    if (this._firstRow !== 'fieldName' && this._firstRow !== 'letter') {
      return false; // just a data raw
    }
    this._fieldNames = {};
    for (let l = 0; l < row.length; l++) {
      this._fieldNames[row[l]] = l;
    }
    this._lookup.fieldNames = this._fieldNames;
    return true; // do not processes any more
  }

  _fieldValue(field) {
    if (typeof field === 'string') {
      return Jexl.evalSync(field, this._lookup);
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
    if (this._fieldNames === false) {
      if (this._compileRow(row)) {
        return false
      }
    }
    let result = {};

    this._lookup.row = row;
    lookupErr = false;
    for (let fieldName in this._fields) {
      if (!this._fields.hasOwnProperty(fieldName)) { continue };
      let value = this._fieldValue(this._fields[fieldName]);
      if (value !== undefined) {
        result[fieldName] = value;
      }
      if (lookupErr) {
        throw lookupErr
      }
    }

    // for (let l = 0; l < this._compiled.length; l++) {
    //   let field = this._compiled[l];
    //   if (result[field.fieldName] && !_.isArray(result[field.fieldName])) {
    //     result[field.fieldName] = [result[field.fieldName]];
    //   }
    //   let data = this._fieldToValue(field, row);
    //   if (data !== undefined) {
    //     // check for field.forceArray to make it an array
    //     if (field.forceArray && result[field.fieldName] === undefined) {
    //       result[field.fieldName] = []
    //     }
    //     if (_.isArray(result[field.fieldName])) {
    //       result[field.fieldName].push(data);
    //     } else {
    //       result[field.fieldName] = data;
    //     }
    //   }
    // }
    return result;
  }
}

module.exports.RowToObject = RowToObject2;