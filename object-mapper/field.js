/**
 * The field base class for creating other types
 */

const Joi = require('@hapi/joi');

class ErrorNotValid extends Error {
  constructor(field, message = false) {
    super(message ? message : `field ${field}`);
    this.type = 'ErrorNotValid';
    this.fieldname = field
  }
}


class Field {

  constructor(options = {}) {
    this._name = 'field';
    if (options.emptyAllow) { // if field is set but other ones are not, the field is remove
      this.emptyAllow = true;
    }
  }
  get name() {
    return this._name;
  }

  log(logger, type, fieldName, message) {
    if (logger) {
      logger[type](fieldName, message);
    }
  }

  checkSchema(fieldName, data, schema, logger = false) {
    const {error, value} = Joi.validate(data, schema);
    if (error) {
      if (logger) {
        logger.error(fieldName, error);
        return false;
      } else {
        throw new ErrorNotValid(fieldName, error)
      }
    }
    return true;
  }

  isEmpty(data) {
    return true;
  }
  /**
   * validate a fields properties (keys)
   * it ONLY checkes that the structure of data can be handled by this routine
   *
   * @param fieldName String,
   * @param data Object|String|Or what ever is given   *
   * @param logger Class logger class. if available the info is logged to this object
   * @return {boolean} True: it can be handled, False: structure has an error
   */
  validate(fieldName, data, logger = false) {
    return true;
    //return this.checkSchema(fieldName, data, new Joi.object())
  }

  /**
   * modifies the data so can be stored
   * @param fieldName
   * @param data
   * @param logger
   * @returns Promise with the the adjusted version of the data || Error
   */
  adjust(fieldName, data, logger = false) {
    return Promise.resolve(data);
  }
  /**
   * adjust the object. if error or warnings use the logger
   * @param object
   * @param logger
   * @param options
   */
  convert(fieldName, data, logger) {
    if (this.validate(fieldName, data, logger)) {
      return this.adjust(fieldName, data, logger)
    }
  }
}

module.exports.Field = Field;
module.exports.ErrorNotValid = ErrorNotValid;