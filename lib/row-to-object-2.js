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

const ErrorTypes = require('error-types');
const BaseConvert = require('./basic-convert');
const x = require('./jexl.include');
const _ = require('lodash');
const LOOP_KEY = require('./basic-convert').LOOP_KEY

const Jexl = require('jexl');
// // FOR Error bug:
// // SHOULD PLACE: https://github.com/TomFrost/Jexl/pull/53/commits/78ced5b4400999165c9f1f39cb89e801fe714d53
//
// Jexl.addTransform('trim', (val) => val.trim());
// Jexl.addTransform('ltrim', (val) => val.trimStart());
// Jexl.addTransform('rtrim', (val) => val.trimEnd());
// Jexl.addTransform( 'length', (val) => val.length);
//
// // case insensitive
// Jexl.addBinaryOp('|=|', 20, (a, b) => {
//   return typeof a === 'string' && typeof b === 'string'
//     ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
//     : a === b;
// });


// https://stackoverflow.com/questions/2357618/is-there-such-a-thing-as-a-catch-all-key-for-a-javascript-object


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
    if (name === '__date') {
      return new Date()
    }
    if (name === 'field') {
      let result  = {};
      for (let key in obj.fieldNames) {
        if (!obj.fieldNames.hasOwnProperty(key)) { continue }
        result[key] = obj.row[obj.fieldNames[key]];
      }
      return result;
    }
    // Jexl parse bug, stop the Error from getting down. So store the error and check at the end
    if (obj.fieldNames[name] === undefined) {
      if (name === 'column') {
        return obj.row;
      }
      throw new ErrorTypes.ErrorFieldNotFound(name);
    }

    return obj.row[obj.fieldNames[name]];
  },
  fieldNames: false,
  row: false,
};


class RowToObject2 extends BaseConvert {
  constructor(definition = {}) {
    super(definition);
    this._didCompile = false;
    this._firstRow = definition.firstRow ? definition.firstRow : 'fieldName'; // 'index';
    if (['fieldName', 'index', 'letter'].indexOf(this._firstRow) < 0) { throw new Error('firstRow can only be fieldName, index or letter')}
    this._fields = definition.fields;
//    this._fieldNames = false;
    this._spaceHandler = definition.spaceHandler !== undefined ? definition.spaceHandler : false;
 //   if (['remove', '_'].indexOf(this._spaceHandler) === -1) { throw new Error(`invalid spaceHandler. allowed are remove or _`)}
    this._idField = definition.idField ? definition.idField : 'id';
    this._lookup = new Proxy({}, rowLookup);
    // does not work anymore (looks like it)
    this._emptyCheck = definition.emptyCheck ? definition.emptyCheck : 'length';
    if (['length', 'undefined', 'none'].indexOf(this._emptyCheck) === -1) { throw new Error(`invalid emptyCheck. allowed are space or length`)}
  }

  _toColumnName(num) {
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;
  }

  get fields() {
    return this._fields;
  }
  set fields(value) {
    this._fields = value;
  }
  get idField() {
    return this._idField;
  }
  set idField(value) {
    this._idField = value;
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
          let name = this._spaceHandler === false ? row[l] : row[l].replace(' ', this._spaceHandler);
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

  // _checkEmpty(value) {
  //   switch (this._emptyCheck) {
  //     case 'length' :
  //       if (value && typeof value === 'string' && value.length > 0) {
  //         return value;
  //       } else if (value !== undefined && typeof value !== 'string') { // number or boolean
  //         return value;
  //       } else {
  //         return  undefined;
  //       }
  //     case 'undefined': return value;
  //     default:
  //       throw new Error(`unknown ${this._emptyCheck}`)
  //   }
  // }

//   _fieldValue(field, fieldName, replace = {}) {
//     if (fieldName === LOOP_KEY) {
//       // field should be an array otherwise make it one
//       if (!_.isArray(field)) { field = [field]}
//       let result = [];
//       for (let loopIndex = 0; loopIndex < field.length; loopIndex++) {
//         let loopField = field[loopIndex];
//         let cnt = this._fieldValue(loopField.count, 'count', replace);
//         let indexName = field.index === undefined ? '$$INDEX' : field.index;
//         for (let rowIndex = 0; rowIndex < cnt; rowIndex++) {
//            result.push(this._fieldValue(loopField.block, 'block', _.merge(replace, {[indexName]: rowIndex})))
//         }
//         if (loopField.include) {
//           for (let includeIndex = 0; includeIndex < loopField.include.length; includeIndex++) {
//             let others = this._fieldValue(loopField.include[includeIndex], 'block', replace)
//             result.push(others);
//             // console.log(others)
//           }
//         }
//       }
//       return result;
//     }
//    if (Array.isArray(field)) {
//       let result = [];
//       for (let l = 0; l < field.length; l++) {
//         try {
//           let value = this._fieldValue(field[l], `[${l}]`, replace);
//           if (value !== undefined) {
//             result.push(value);
//           }
//         } catch( e) {
//           if (e.type === 'ErrorFieldNotFound') {
//             e.fieldName = `${fieldName}${e.fieldName}`;
//           }
//           throw e;
//         }
//       }
//       return result.length ? result : undefined;
//     } else if (_.isObject(field)) { // it's an object
//       let result = {};
//       for (let propName in field) {
//         try {
//           if (!field.hasOwnProperty(propName)) {
//             continue
//           }
//           let value = this._fieldValue(field[propName], propName, replace);
//           if (value !== undefined) {
//             if (propName === LOOP_KEY) {
//               result = value;
//             } else {
//               result[propName] = value;
//             }
//           }
//         } catch( e) {
//             if (e.type === 'ErrorFieldNotFound') {
//               e.fieldName = `${fieldName}.${e.fieldName}`;
//             }
//             throw e;
//           }
//       }
//       return Object.keys(result).length === 0 ? undefined : result;
//     } else {
// //     if (typeof field === 'string' || typeof field === 'number') {
//        try {
//          let s = field;
//          for (let varName in replace) {
//            if (!replace.hasOwnProperty(varName)) { continue}
//            s = s.replace(varName, replace[varName]);
//          }
//          // return this._checkEmpty(Jexl.evalSync(field, this._lookup));
//          return this._checkEmpty(Jexl.evalSync(s, this._lookup));
//        } catch(e) {
//          if (e.type === 'ErrorFieldNotFound') {
//            e.fieldName = fieldName + '.' +  e.fieldName;
//          } else if (e instanceof TypeError) {
//            throw new ErrorTypes.ErrorFieldNotFound(fieldName + '.' +  e.fieldName, 'Field is of the wrong type')
//          }
//          throw e;
//        }
//   //   } else
//      }
//   }
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
      let value = this._fieldValue(this._fields[fieldName], fieldName);
      if (value !== undefined) {
        if (fieldName === LOOP_KEY) {
          result = _.merge(result, value);
        } else {
          result[fieldName] = value;
        }
      }
      // if (lookupErr) { // bug in parse makes it invisible here
      //   throw lookupErr
      // }
    }
    return result;
  }

    /**
   * reset the field buffer
   */
  reset() {
    this._didCompile = false;
  }
}

module.exports.RowToObject = RowToObject2;
