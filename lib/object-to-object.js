
const ErrorTypes = require('error-types');
const BaseConvert = require('./basic-convert');
const Jexl = require('jexl');
const x = require('./jexl.include');
const moment = require('moment');
const LOOP_KEY = require('./basic-convert').LOOP_KEY

let rowLookup = {
  get: function(obj, name) {
    //if (obj.object.[name] !== undefined) {
    if (obj.object.hasOwnProperty(name)) {
      return obj.object[name];
    }
    if (name === 'undefined') {
      return undefined;
    }
    if (name === '__date') {
      return new Date()
    }
    if (name === 'field') {
      return obj.object;
    }
    if (this.allowNotDefined) {
      return undefined
    } else {
      throw new ErrorTypes.ErrorFieldNotFound(name);
    }
    // return obj.object[obj.fieldNames[name]];
  },
  fieldNames: false,
  object: false,
  allowNotDefined: false
};

class ObjectToObject extends BaseConvert {
  constructor(definition = {}) {
    super(definition);
    this._fields = definition.fields;
    this._locale = definition.locale ? definition.locale : 'nl';
    moment.locale(this._locale);
    this._idField = definition.idField ? definition.idField : 'id';
    rowLookup.allowNotDefined = definition.hasOwnProperty('allowNotDefined') ? !!definition.allowNotDefined : false;
    this._lookup = new Proxy({}, rowLookup);
  }



  convert(data) {
    let result = {};

    this._lookup.object = data;
    for (let fieldName in this._fields) {
      if (!this._fields.hasOwnProperty(fieldName)) { continue }
      let value = this._fieldValue(this._fields[fieldName], fieldName);
      if (value !== undefined) {
        if (fieldName === this.loopStatement || fieldName === this.ifStatement) {
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
