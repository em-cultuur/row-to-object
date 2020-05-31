
const _ = require('lodash');
const LOOP_KEY = '$$LOOP';
const Jexl = require('jexl');
const ErrorTypes = require('error-types');
const x = require('./jexl.include');


class BasicConvert {

  constructor(options) {
    // if the string starts with this, it's an evaluation,
    this._checkEvalString = options.hasOwnProperty('evalString') ? options.evalString : false;
    this._checkEvalStringLength = this._checkEvalString ? this._checkEvalString.length : 0;
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
      case 'undefined':
      case undefined:
      case 'none':
        return value;
      default:
        throw new Error(`unknown ${this._emptyCheck}`)
    }
  }

  _resultValue(value, lookup) {
    if (this._checkEvalStringLength === 0 ||
      (typeof value === 'string' && value.substring(0, this._checkEvalStringLength) === this._checkEvalString )) {
      return Jexl.evalSync(value.substring(this._checkEvalStringLength), lookup)
    }
    return value;
  }

  _fieldValue(field, fieldName, replace = {}) {
    if (fieldName === LOOP_KEY) {
      // field should be an array otherwise make it one
      if (!_.isArray(field)) { field = [field]}
      let result = [];
      for (let loopIndex = 0; loopIndex < field.length; loopIndex++) {
        let loopField = field[loopIndex];
        let cnt = this._fieldValue(loopField.count, 'count', replace);
        let indexName = field.index === undefined ? '$$INDEX' : field.index;
        if (loopField.header) {
          for (let headerIndex = 0; headerIndex < loopField.header.length; headerIndex++) {
            let others = this._fieldValue(loopField.header[headerIndex], 'block', replace)
            result.push(others);
          }
        }
        for (let rowIndex = 0; rowIndex < cnt; rowIndex++) {
          result.push(this._fieldValue(loopField.block, 'block', Object.assign({}, replace, {[indexName]: rowIndex})))
        }
        if (loopField.include) {
          // ToDo remove in V2: loopField.include should have called it footer
          loopField.footer = loopField.include
        }
        if (loopField.footer) {
          for (let footerIndex = 0; footerIndex < loopField.footer.length; footerIndex++) {
            let others = this._fieldValue(loopField.footer[footerIndex], 'block', replace)
            result.push(others);

          }
        }
      }
      return result;
    }
    if (Array.isArray(field)) {
      let result = [];
      for (let l = 0; l < field.length; l++) {
        try {
          let value = this._fieldValue(field[l], `[${l}]`, replace);
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
    } else if (_.isObject(field)) { // it's an object
      let result = {};
      // emptyCheck can change the behavour of the parser
      let localEmptyCheck = this._emptyCheck;
      if (field['#emptyCheck']) {
        this._emptyCheck = field['#emptyCheck'];
      }
      for (let propName in field) {
        try {
          if (!field.hasOwnProperty(propName) || propName === '#emptyCheck') {
            continue
          }

          let value = this._fieldValue(field[propName], propName, replace);
          if (value !== undefined) {
            if (propName === LOOP_KEY) {
              result = value;
            } else {
              result[propName] = value;
            }
          }
        } catch( e) {
          if (e.type === 'ErrorFieldNotFound') {
            e.fieldName = `${fieldName}.${e.fieldName}`;
          }
          throw e;
        }
      }
      this._emptyCheck = localEmptyCheck;
      return Object.keys(result).length === 0 ? undefined : result;
    } else {
//     if (typeof field === 'string' || typeof field === 'number') {
      try {
        let s = field;
        for (let varName in replace) {
          if (!replace.hasOwnProperty(varName)) { continue}
          s = s.replace(varName, replace[varName]);
        }
        // return this._checkEmpty(Jexl.evalSync(field, this._lookup));
        return this._checkEmpty(this._resultValue(s, this._lookup));
      } catch(e) {
        if (e.type === 'ErrorFieldNotFound') {
          e.fieldName = fieldName + '.' +  e.fieldName;
        } else if (e instanceof TypeError) {
          throw new ErrorTypes.ErrorFieldNotFound(fieldName + '.' +  e.fieldName, e.message)
        }
        throw e;
      }
      //   } else
    }
  }
}

module.exports = BasicConvert;
module.exports.LOOP_KEY = LOOP_KEY
