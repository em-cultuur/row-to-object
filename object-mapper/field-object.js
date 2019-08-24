/**
 * an structured object
 */

const Field = require('./field').Field;
const _ = require('lodash');

class ErrorFieldNotAllowed extends Error {
  constructor(fields, message = false) {
    super(message ? message : `field${fields.length > 1 ? 's' : ''} "${fields.join(', ')}" not defined`);
    this.type = 'ErrorFieldNotAllowed';
    this.fields = fields
  }
}

class FieldObject extends Field {

  constructor(options = {}){
    super(options);
    this._name = 'object';
    // add here the fieldName: fieldDefinition
    this._fields = options.fields !== undefined ? options.fields : {};
  }


  /**
   *
   * @param fieldName
   * @param data
   * @param logger
   */
  validate(fieldName, data, logger = false) {
    let isValid = true;
    for (let name in data) {
      if (!data.hasOwnProperty(name)) { continue }
      let fieldDefinition = this._fields[name];
      let subName = fieldName + '.' + name;
      if (fieldDefinition === undefined) {
        this.log(logger, 'error', subName, 'field does not exist');
        isValid = false;
      } else {
        isValid = isValid && fieldDefinition.validate(subName, data[name], logger )
      }
    }
    return isValid;
  }

  isEmpty(data) {
    for (let key in this._fields) {
      if (!this._fields.hasOwnProperty(key)) { continue}
      if (!this._fields[key].isEmpty(data[key])) {
        return false;
      }
    }
    return true;
  }

  copyFieldsToResult(result, data, skip = []) {
    for (let key in data) {
      if (!data.hasOwnProperty(key)) { continue }
      if (result[key] === undefined && data[key] !== undefined && skip.indexOf(key) < 0) {
        result[key] = data[key]
      }
    }
    // remove the skipped fields
    for (let l = 0; l < skip.length; l++) {
      delete result[skip[l]];
    }
    return result;
  }
  /**
   * just process all keys individual
   *
   * @param fieldName
   * @param fields the field parsers
   * @param data the data given
   */
  async processKeys(fieldName, fields, data, logger) {
    // valid object: fields
    let result = {};
    for (let name in fields) {
      if (!fields.hasOwnProperty(name)) {
        continue
      }
      let subName = fieldName + '.' + name;
      try {
        let fieldDefinition = fields[name];
        result[name] = await fieldDefinition.convert(fieldName, data[name], logger);
      } catch (e) {
        this.log(logger,'error', subName, e.message);
      }
    }
    return Promise.resolve(result);
  }

  /**
   * adjust the object. if error or warnings use the logger
   * @param object
   * @param logger
   * @param options
   */
  convert(fieldName, data, logger = false) {
    let isValid = [];
    let fields = {};
    // create the list of fields to process
    for (let name in data) {
      if (!data.hasOwnProperty(name)) { continue  }
      let fieldDefinition = this._fields[name];
      let subName = fieldName + '.' + name;
      if (fieldDefinition === undefined) {
        this.log(logger, 'error', subName, 'field does not exist');
        isValid.push(name);
      } else if (!fieldDefinition.isEmpty(data[name])) {
        // empty fields are removed
        fields[name] = this._fields[name];
      }
    }
    if (isValid.length > 0) {
      return Promise.reject(new ErrorFieldNotAllowed(isValid));
    } else if (_.isEmpty(fields)) {
      return Promise.resolve({});
    } else {
      // check the emptyAllow isn't set for all
      for (let key in fields) {
        if (!fields.hasOwnProperty(key)) { continue }
        if (fields[key].emptyAllow === undefined || fields[key] .emptyAllow === false) {
          return this.processKeys(fieldName, fields, data, logger).then((rec) => {
            return Promise.resolve(rec)
          })
        }
      }
      return Promise.resolve({});
    }
  }
}

module.exports.FieldObject = FieldObject;
module.exports.ErrorFieldNotAllowed = ErrorFieldNotAllowed;