
const _ = require('lodash');
const LOOP_KEY = '$$LOOP';
const IF_KEY = '$$IF';
const Jexl = require('jexl');
const ErrorTypes = require('error-types');
const x = require('./jexl.include');


class BasicConvert {

  constructor(options) {
    switch(options.emptyCheck) {
      case 'undefined':
      case undefined:
      case false:
      case 'none':
        this._emptyCheck = 'none';
        break;
      case 'length':
        this._emptyCheck = 'length'
        break;
      default:
        throw new Error(`invalid emptyCheck: ${options.emptyCheck}. allowed are length, none, undefined`)
    }
    this._ifStatement = options.hasOwnProperty('markers') && options.markers.ifStatement ? options.markers.ifStatement : IF_KEY;
    this._loopStatement = options.hasOwnProperty('markers') && options.markers.loopStatement ? options.markers.loopStatement : LOOP_KEY;
    this._index = options.hasOwnProperty('markers') && options.markers.hasOwnProperty('index') ? options.markers.index : '$$INDEX';
    this._count = options.hasOwnProperty('markers') && options.markers.hasOwnProperty('count') ? options.markers.count : 'count';
    this._condition = options.hasOwnProperty('markers') && options.markers.hasOwnProperty('condition') ? options.markers.condition : 'condition';
    this._default = options.hasOwnProperty('markers') && options.markers.hasOwnProperty('default') ? options.markers.default : 'default';
    this._checkEvalString = options.hasOwnProperty('evalString') ? options.evalString : options.markers && options.markers.hasOwnProperty('evalString') ? options.markers.evalString : false;
    this._checkEvalStringLength = this._checkEvalString ? this._checkEvalString.length : 0;
  }

  get loopStatement() {
    return this._loopStatement
  }
  get ifStatement() {
    return this._ifStatement
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
      case 'none':
        return value;
      default:
        throw new Error(`unknown ${this._emptyCheck}`)
    }
  }
  _containsObject(obj, list) {
    var x;
    for (x in list) {
      if (list.hasOwnProperty(x) && JSON.stringify(list[x]) === JSON.stringify(obj)) {
        return true;
      }
    }
    return false;
  }
  _resultValue(value, lookup) {
    if (this._checkEvalStringLength === 0 ||
      (typeof value === 'string' && value.substring(0, this._checkEvalStringLength) === this._checkEvalString )) {
      return Jexl.evalSync(value.substring(this._checkEvalStringLength), lookup)
    }
    return value;
  }

  _fieldValue(field, fieldName, replace = {}) {
    if (fieldName === this._loopStatement) {
      // field should be an array otherwise make it one
      if (!_.isArray(field)) { field = [field]}
      let result = [];
      for (let loopIndex = 0; loopIndex < field.length; loopIndex++) {
        let loopField = field[loopIndex];
        let cnt = this._fieldValue(loopField.count, this._count, replace);
        let indexName = field.index === undefined ? this._index : field.index;
        if (loopField.header) {
          for (let headerIndex = 0; headerIndex < loopField.header.length; headerIndex++) {
            let others = this._fieldValue(loopField.header[headerIndex], 'block', replace)
            result.push(others);
          }
        }
        for (let rowIndex = 0; rowIndex < cnt; rowIndex++) {
          let itemResult = this._fieldValue(loopField.block, 'block', Object.assign({}, replace, {[indexName]: rowIndex}))
          if(!this._containsObject(itemResult, result)) {
            result.push(itemResult)
          }
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
    if (fieldName === this._ifStatement) {
      let directResult = !Array.isArray(field);
      if (!Array.isArray(field)) { field = [field]} // it should always be an array

      let result = [];
      for (let ifIndex = 0; ifIndex < field.length; ifIndex++) {
        let ifField = field[ifIndex];
        if (ifField[this._condition]) {
          let condition = this._fieldValue(ifField[this._condition], this._condition, replace);
          if (ifField[condition]) {
            result.push(this._fieldValue(ifField[condition], `if.${condition}`, replace))
          } else if (ifField[this._default]) {
            result.push(this._fieldValue(ifField[this._default], `if.${condition}`, replace))
          }
        }
        if (directResult) {
          return result.length ? result[0] : undefined;
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
          if (this._emptyCheck === 'none' || value !== undefined) {
            if (propName === this._loopStatement || propName === this._ifStatement) {
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
      return result === undefined || Object.keys(result).length === 0 ? undefined : result;
    } else {
//     if (typeof field === 'string' || typeof field === 'number') {
      try {
        let s = field;
        for (let varName in replace) {
          if (!replace.hasOwnProperty(varName)) { continue}
          s = s.split(varName).join(replace[varName]); // replaceAll does not really exist
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
module.exports.LOOP_KEY = LOOP_KEY;
module.exports.IF_KEY = IF_KEY;
