
const ErrorTypes = require('error-types');
const Jexl = require('jexl');
const x = require('./jexl.include');
const moment = require('moment');

// hate globals but the rowLookup keeps dropping the err variable ????
// let lookupErr = false;
let rowLookup = {
  get: function(obj, name) {
    if (obj.object[name] !== undefined) {
      return obj.object[name];
    }
    if (name === 'undefined') {
      return undefined;
    }
    // // Jexl parse bug, stop the Error from getting down. So store the error and check at the end
    // if (obj.fieldNames[name] === undefined) {
    //   if (name === 'column') {
    //     return obj.row;
    //   }
    if (name === '__date') {
      return new Date()
    }
    if (name === 'field') {
      return obj.object;
    }
    throw new ErrorTypes.ErrorFieldNotFound(name);
    // }
    return obj.object[obj.fieldNames[name]];
  },
  fieldNames: false,
  object: false,
};

class ObjectToObject {
  constructor(definition = {}) {

    this._fields = definition.fields;
    this._locale = definition.locale ? definition.locale : 'nl';
    moment.locale(this._locale);
    this._idField = definition.idField ? definition.idField : 'id';
    this._lookup = new Proxy({}, rowLookup);
    this._emptyCheck = definition.emptyCheck ? definition.emptyCheck : 'length';
    if (['length', 'undefined'].indexOf(this._emptyCheck) === -1) { throw new Error(`invalid emptyCheck. allowed are space or length`)}

  }

  _checkEmpty(value) {
    switch (this._emptyCheck) {
      case 'length' :
        if (value && typeof value === 'string' && value.length > 0) {
          return value;
        } else if (value !== undefined && typeof value !== 'string') { // number or boolean
          return value;
        } else {
          return  undefined;
        }
      case 'undefined': return value;
      default:
        throw new Error(`unknown ${this._emptyCheck}`)
    }
  }


  _fieldValue(field, fieldName) {
    if (typeof field === 'string' || typeof field === 'number') {
      try {
        return this._checkEmpty(Jexl.evalSync(field, this._lookup));
      } catch(e) {
        if (e.type === 'ErrorFieldNotFound') {
          e.fieldName = fieldName + '.' +  e.fieldName;
        } else if (e instanceof TypeError) {
          throw new ErrorTypes.ErrorFieldNotFound(fieldName + '.' +  e.fieldName, 'Field is of the wrong type')
        }
        throw e;
      }
    } else if (Array.isArray(field)) {
      let result = [];
      for (let l = 0; l < field.length; l++) {
        try {
          let value = this._fieldValue(field[l], `[${l}]`);
          if (value !== undefined) {
            result.push(value);
          }
        } catch( e) {
          if (e.type === 'ErrorFieldNotFound') {
            e.fieldName = `${fieldName}${e.fieldName}`;
          }
          throw e;
        }
      }
      return result.length ? result : undefined;
    } else { // it's an object
      let result = {};
      for (let propName in field) {
        try {
          if (!field.hasOwnProperty(propName)) {
            continue
          }
          let value = this._fieldValue(field[propName], propName);
          if (value !== undefined) {
            result[propName] = value;
          }
        } catch( e) {
          if (e.type === 'ErrorFieldNotFound') {
            e.fieldName = `${fieldName}.${e.fieldName}`;
          }
          throw e;
        }
      }
      return Object.keys(result).length === 0 ? undefined : result;
    }
  }

  convert(data) {
    let result = {};

    this._lookup.object = data;
    for (let fieldName in this._fields) {
      if (!this._fields.hasOwnProperty(fieldName)) { continue }
      let value = this._fieldValue(this._fields[fieldName], fieldName);
      if (value !== undefined) {
        result[fieldName] = value;
      }
    }
    return result;
  }
}

module.exports.ObjectToObject = ObjectToObject;
