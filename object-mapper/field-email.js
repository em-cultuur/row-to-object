/*
 *
 */

const FieldText = require('./field').Field;
const _ = require('lodash');
const ErrorNotValid = require('./field').ErrorNotValid;


class FieldEmail extends FieldText {

  constructor(options = {}){
    super(options);
    this._name = 'email';
  }

  validate(fieldName, data, logger = false) {
    if (super.validate(fieldName, data, logger)) {
      return true;
    }
    return false;
  }

  adjust(fieldName, email, logger = false) {

    if (email === undefined || email.length === 0) {
      return undefined;
    }
    email = _.replace(email, /</g, '');
    email = _.replace(email, />/g, '');
    email = _.toLower(email);
    email = email.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    email = _.replace(email, /\n/g, '');
    email = _.replace(email, /\t/g, '');
    email = _.replace(email, /\r/g, '');
    email = _.replace(email, / /g, '');
    return Promise.resolve(email)
  }

  /**
   * we must first clear the errors before validating
   *
   * @param fieldName
   * @param data
   * @param logger
   * @return {*}
   */
  convert(fieldName, data, logger) {
    return this.adjust(fieldName, data, logger).then( (rec) => {
      if (this.validate(fieldName, data, logger)) {
        return Promise.resolve(rec)
      }
      return Promise.reject(new ErrorNotValid(fieldName))
    })
  }
}

module.exports.FieldEmail = FieldEmail;