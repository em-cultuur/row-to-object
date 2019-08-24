/*
 *
 */

const FieldText = require('./field-text').FieldText;
const _ = require('lodash');
const ErrorNotValid = require('./field').ErrorNotValid;


class FieldTextTelephone extends FieldText {

  constructor(options = {}){
    super(options);
    this._name = 'telephone';
    this._PNF = require('google-libphonenumber').PhoneNumberFormat;
    this._phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
    this._formatLocal = options.formatLocal ? options.formatLocal : '0NC-N';
    this._format = options.formatLocal ? options.formatLocal : '+CC (NC) N';
    this._country = options.country ? options.country.toUpperCase(): 'NL';
    this._countryCode = options.countryCode ? options.countryCode : 31;

  }

  // validate(fieldName, data, logger = false) {
  //   if (super.validate(fieldName, data, logger)) {
  //     if (data && data.length) {
  //       var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //       return re.test(data);
  //     }
  //     return true;
  //   }
  //   return false;
  // }

  /**
   * Function to detect netCode and number from internationally formatted phone
   * By Jelle
   *
   * @param phoneInt              internationally formatted phonenumber
   * @param countryCode           country code ie 31 for NL
   * @returns {Object}            returns splitted netCode and number
   * @private
   */
   _checkNetCodeAndNumber(phoneInt, countryCode) {
    const number = {
      number: '',
      netCode: ''
    };

    number.netCode = phoneInt.substring(phoneInt.indexOf(' ') + 1);
    number.netCode = number.netCode.replace(/-/g, ' ');
    if (number.netCode.indexOf(' ') !== -1 && number.netCode.substring(number.netCode.indexOf(' ') + 1).length >= 7) {
      number.number = number.netCode.substring(number.netCode.indexOf(' ') + 1);
      number.netCode = number.netCode.substring(0, number.netCode.indexOf(' '));
    } else if (countryCode === 31 && number.netCode.indexOf(' ') === -1) {
      number.number = number.netCode.substring(2);
      number.netCode = number.netCode.substring(0, 2);
    } else {
      number.number = number.netCode;
      number.netCode = '';
    }
    return number;
  }

  adjust(fieldName, telephone, logger = false) {

    if (telephone === undefined || telephone.length === 0) {
      return undefined;
    }
    let tel = this._phoneUtil.parse(telephone, this._country); // this._defaultCountryCode());
    let format = this._format;
    let countryCode = tel.getCountryCode(); 
    if (countryCode === this._countryCode) {
      format = this._formatLocal
    }
    
    const phoneInt = this._phoneUtil.format(tel, this._PNF.INTERNATIONAL);
    const number = this._checkNetCodeAndNumber(phoneInt, countryCode);

    if (!number.netCode) {
      format = format.replace('(NC)', '');
      format = format.replace('NC-', '');
      format = format.replace('NC', '');
    }

    format = format.replace('CC', countryCode);
    format = format.replace('NC', number.netCode);
    format = format.replace('NS', number.number);
    format = format.replace('N', number.number.replace(/ /g,''));
    format = format.replace(/  /g, ' ');
    return Promise.resolve(format);
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

module.exports.FieldTextTelephone = FieldTextTelephone;