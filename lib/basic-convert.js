
const _ = require('lodash');
const LOOP_KEY = '$$LOOP';
const Jexl = require('jexl');
const x = require('./jexl.include');


class BasicConvert {

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


  _fieldValue(field, fieldName, replace = {}) {
    if (fieldName === LOOP_KEY) {
      // field should be an array otherwise make it one
      if (!_.isArray(field)) { field = [field]}
      let result = [];
      for (let loopIndex = 0; loopIndex < field.length; loopIndex++) {
        let loopField = field[loopIndex];
        let cnt = this._fieldValue(loopField.count, 'count', replace);
        let indexName = field.index === undefined ? '$$INDEX' : field.index;
        for (let rowIndex = 0; rowIndex < cnt; rowIndex++) {
          result.push(this._fieldValue(loopField.block, 'block', _.merge(replace, {[indexName]: rowIndex})))
        }
        if (loopField.include) {
          for (let includeIndex = 0; includeIndex < loopField.include.length; includeIndex++) {
            let others = this._fieldValue(loopField.include[includeIndex], 'block', replace)
            result.push(others);
            // console.log(others)
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
      for (let propName in field) {
        try {
          if (!field.hasOwnProperty(propName)) {
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
        return this._checkEmpty(Jexl.evalSync(s, this._lookup));
      } catch(e) {
        if (e.type === 'ErrorFieldNotFound') {
          e.fieldName = fieldName + '.' +  e.fieldName;
        } else if (e instanceof TypeError) {
          throw new ErrorTypes.ErrorFieldNotFound(fieldName + '.' +  e.fieldName, 'Field is of the wrong type')
        }
        throw e;
      }
      //   } else
    }
  }
}

module.exports = BasicConvert;
module.exports.LOOP_KEY = LOOP_KEY
