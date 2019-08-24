/**
 * Object mapper
 * convert the data of fields into something else
 *
 * version 0.0.1 JvK 2019-08-21
 */

const FieldText = require('./field-text').fieldText;
const FieldEmail = require('./field-text-email');
const Record = require('./record');
const Logger = require('./logger');

class ObjectMapper {

  /**
   *
   *
   * @param options Object
   *   - logger { }
   */
  constructor(options = {}) {
    this._fieldnameMapper = {
      '' : new Record(options.record),
      'fullName' : FieldText,
      'email' : FieldEmail,
    }
  }

  _warn(logger, fieldName = 'unknown', msg = 'no warning') {
    if (logger && logger.warn) {
      logger.warn(fieldName, msg)
    }
  }

  /**
   * convert the object
   *
   * @param obj Object a valid AdreZ object
   * @param logger
   * @param options
   */
  convert(obj, logger = {}, options = {}) {
    for (let fieldName in obj) {
      if (obj.hasOwnProperty(fieldName)) { continue }
      if (this._fieldnameMapper[fieldName] === undefined) {
        this._warn(logger, fieldName, 'unknown field type');
      } else {
        let field = obj[fieldName];
        if (Array.isArray(field)) {

        }
        this._fieldnameMapper[fieldName].convert(obj, logger, options);
      }
    }

  }

}

module.exports = {
  ObjectMapper
};