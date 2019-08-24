/*
 *
 */

const FieldText = require('./field-text').FieldText;
const _ = require('lodash');
const ErrorNotValid = require('./field').ErrorNotValid;


class FieldTextEmail extends FieldText {

  constructor(options = {}){
    super(options);
    this._name = 'email';
  }

  validate(fieldName, data, logger = false) {
    if (super.validate(fieldName, data, logger)) {
      if (data && data.length) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(data);
      }
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
      if (this.validate(fieldName, rec, logger)) {
        return Promise.resolve(rec)
      }
      this.log(logger, 'error', fieldName, `${rec} is not a valid email`)
      return Promise.resolve('' )
    })
  }
}

module.exports.FieldTextEmail = FieldTextEmail;