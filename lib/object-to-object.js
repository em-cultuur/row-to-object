
const ErrorTypes = require('error-types');
const BaseConvert = require('./basic-convert');
const Jexl = require('jexl');
const x = require('./jexl.include');
const moment = require('moment');
const LOOP_KEY = require('./basic-convert').LOOP_KEY

// hate globals but the rowLookup keeps dropping the err variable ????
// let lookupErr = false;
let rowLookup = {
  get: function(obj, name) {
    //if (obj.object.[name] !== undefined) {
    if (obj.object.hasOwnProperty(name)) {
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

class ObjectToObject extends BaseConvert {
  constructor(definition = {}) {
    super(definition);
    this._fields = definition.fields;
    this._locale = definition.locale ? definition.locale : 'nl';
    moment.locale(this._locale);
    this._idField = definition.idField ? definition.idField : 'id';
    this._lookup = new Proxy({}, rowLookup);
    // is not used anymore (lookslike it)
    }



  convert(data) {
    let result = {};

    this._lookup.object = data;
    for (let fieldName in this._fields) {
      if (!this._fields.hasOwnProperty(fieldName)) { continue }
      let value = this._fieldValue(this._fields[fieldName], fieldName);
      if (value !== undefined) {
        if (fieldName === LOOP_KEY) {
          result = _.merge(result, value);
        } else {
          result[fieldName] = value;
        }
      }
    }
    return result;
  }
}

module.exports.ObjectToObject = ObjectToObject;
