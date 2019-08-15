/**
 * convert a row into an object
 *
 * version 0.0.1  JvK 2019-08-14
 *
 *
 * config = {
 *   firstRow: 'fieldnames',  // index || letters
 *   fields: {
 *     id: "IdentificatieMedewerker"
 *     fullName: {
 *       _value: "SamengesteldeNaam",
 *       required: true
 *     },
 *     telephone: {
 *       _index: "0",
 *       value: "Telefoonnummer"
 *       type: "=work"
 *     },
 *     email: [
 *       {
 *         _index: "0",
 *         value: "EmailAdres:
 *         type: "=work"
 *         required: true
 *       },
 *       {
 *         _index: "1",
 *         value: "Niewsbrief",
 *         type: "=newsletter",
 *         required: true
 *       }
 *     ],
 *     location: {
 *       _index: "0",
 *       "street": "WerkadresStraat",
 *       "number": "WerkadresHuisnummer",
 *       "zipcode": "WerkadresPostcode",
 *       "city": "=Amsterdam",
 *       "countryCode": "=nl
 *     }
 *   }
 * }
 *
 * should create from
 *  IdentificatieMedewerker | SamengesteldeNaam | Telefoonnummer | EmailAdres | Niewsbrief | WerkadresStraat | WerkadresHuisnummer | WerkadresPostcode
 *  ________________________|___________________|________________|____________|____________|_________________|_____________________|__________________
 *  1023040                 | Jan de Hond       | 06 102910292   | inf@tst.nl | xx@tst.nl  | mainstreet      | 23                  | 2017GG
 *
 *  {
 *    id: 102340,
 *    fullName: "Jan de Hond",
 *    telephone: [{ _index: "0", value: "06 102910292", type: "work"}],
 *    email: [{_index: "0", value: "inf@tst.nl", type: "work"}, {_index: "1", value: "xx@tst.nl", type: "newsletter"}],
 *    location: [{_index: "0", street: "mainstreet", number: "23", zipcode: "2017 GG", city: "Amsterdam", countryCode: "nl"}]
 *  }
 */

const _ = require('lodash');

class ErrorFieldNotFound extends Error {
  constructor(field, message = false) {
    super(message ? message : `field ${field}`);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.type = 'ErrorFieldNotFound';
    this.fieldname = field
  }
}

/**
 * convert the def to the index in the array
 * @param fieldName String A or AA or AAA
 * @return Number 0 based entry
 *
 * @private
 */
charToIndex = function(fieldName) {
  fieldName = fieldName.toUpperCase();
  let result = 0;

  for (let l = 0; l < fieldName.length ; l++) {
    let x = fieldName.charCodeAt(l) - 'A'.charCodeAt(0) + 1;  // 1 .. 26
    result = (result * 26) + x;
  }
  return result - 1; // 0 based
};


class RowToObject {
  constructor(definition = {}) {
    this._firstRow = definition.firstRow ? definition.firstRow : 'index';
    if (['fieldName', 'index', 'letter'].indexOf(this._firstRow) < 0) { throw new Error('firstRow can only be fieldName, index or letters')}
    this._fields = definition.fields;
    this._compiled = false;
  }

  _fieldNameToIndex(fieldName, row) {
    let index;
    if (this._firstRow === 'fieldName') {
      index = row.indexOf(fieldName);
    } else if (this._firstRow === 'letter') {
      index = charToIndex(fieldName)
    } else {
      index = _.toNumber(fieldName) - 1 ;
    }
    if (index < 0 || index >= row.length ){
      throw new ErrorFieldNotFound(fieldName);
    }
    return index;
  }
  _isRequired(fields, name) {
    if (fields) {
      return fields.indexOf(name) >= 0;
    }
    return false;
  }

  _compileObject(fieldName, field, row) {
    if (field._value) {
      if (field._value.substr(0, 1) === '=') {
        return {fieldName: fieldName, value: field.substr(1)};
      }
      let index = this._fieldNameToIndex(field._value, row);
      return {fieldName: fieldName, index: index, required: field._required === undefined ? false : !! field._required};
    }
    // its multipart object
    let result = { fieldName: fieldName, fields: []};
    for (let subFieldName in field) {
      if (!field.hasOwnProperty(subFieldName)) { continue }
      if (subFieldName === '_index') {
        result._index = field._index;
      } else {
        let subField = field[subFieldName];
        if (!_.isString(subField)) {
           result.fields.push(this._compileObject(subFieldName, subField, row))
        } else {
          if (subField.substr(0, 1) === '=') {
            result.fields.push({fieldName: subFieldName, value: subField.substr(1)});
          } else {
            let index = this._fieldNameToIndex(subField, row);
            result.fields.push({
              fieldName: subFieldName,
              index: index,
              required: this._isRequired(field._required, subField)
            });
          }
        }
      }
    }
    return result;
    // console.log('Error: missing _value. What did we expect?');
  }
  /**
   * Compiles the field definition so we can loop through the fifelds
   *
   * @param row Array the fieldnames or just the first data row
   * @return Boolean true if row should be skipped
   * @private
   */
  _compileRow(row) {
    this._compiled = [];

    for (let fieldName in this._fields) {
      if (!this._fields.hasOwnProperty(fieldName)) {
        continue
      }
      let field = this._fields[fieldName];
      if (_.isString(field)) {
        // example:  id: "IdentificatieMedewerker"
        if (field.substr(0, 1) === '=') {
          // fixed value
          this._compiled.push({fieldName: fieldName, value: field.substr(1)});
        } else {
          // variable from row
          let index = this._fieldNameToIndex(field, row);
          this._compiled.push({fieldName: fieldName, index: index, required: false});
        }
      } else if (_.isArray(field)) {
        for (let i = 0 ; i < field.length; i++) {
          // should set the _forceArray flag
          this._compiled.push(this._compileObject(fieldName, field[i], row))
        }
      } else if (_.isObject(field)) {  // carefull: Array is also an Object!
        this._compiled.push(this._compileObject(fieldName, field, row))
      }
    }
    return this._firstRow === 'fieldName'; // skip only if field names are on the first row
  }

  /**
   * get the value out of the row
   * @param field
   * @param row
   * @return Value or undefined if not allowed
   * @private
   */
  _fieldToValue(field, row) {
    if (field.value) {
      return field.value;
    } else if (field.index) {
      if (!field.required || row[field.index].length > 0) {
        return row[field.index];
      }
    } else if (field.fields) {
      let obj = {};
      for (let objIndex = 0; objIndex < field.fields.length; objIndex++) {
        let objDef = field.fields[objIndex];
        let r =  this._fieldToValue(objDef, row);
        if (objDef.required && r === undefined) {
          return undefined
        }
        obj[objDef.fieldName] = r;
      }
      if (field._index) {
        obj._index = field._index;
      }
      return obj;
    }
    return undefined;
  }
  /**
   * convert the row into the object
   *
   * @param isFirst Boolean if true it's the first row
   * @param row Array of String the values
   */
  convert(row) {
    if (this._compiled === false) {
      if (this._compileRow(row)) {
        return false
      }
    }
    let result = {};
    for (let l = 0; l < this._compiled.length; l++) {
      let field = this._compiled[l];
      if (result[field.fieldName] && !_.isArray(result[field.fieldName])) {
        result[field.fieldName] = [result[field.fieldName]];
      }
      let data = this._fieldToValue(field, row);
      if (data !== undefined) {
        // check for field.forceArray to make it an array
        if (_.isArray(result[field.fieldName])) {
          result[field.fieldName].push(data);
        } else {
          result[field.fieldName] = data;
        }
      }
    }
    return result;
  }
}

module.exports = {
  RowToObject,
  ErrorFieldNotFound,
  charToIndex
};