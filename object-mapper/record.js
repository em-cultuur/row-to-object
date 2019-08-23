/**
 * array
 */

const Field = require('./field').Field;
const FieldGuid = require('./field-text').FieldGuid;
const FieldContact  = require('./field-contact').FieldContact;
const FieldLocation = require('./field-location').FieldLocation;
const FieldComposed = require('./field-composed').FieldComposed;
const FieldEmail = require('./field-email').FieldEmail;

class Record extends Field {

  constructor(options = {}){
    super(options);
    this._name = 'record';
    this._fields = {
      id: new FieldGuid(),
      contact : new FieldArray(   {type: new FieldContact() }),
      email: new FieldArray(      { type: new FieldComposed({valueType: new FieldEmail()}) } ),
      telephone: new FieldArray(  { type: new FieldComposed({valueType: new FieldText()}) } ),
      location: new FieldArray(   { type : FieldLocation() })
    }
  }

  /**
   * adjust the object. if error or warnings use the logger
   * @param object
   * @param logger
   * @param options
   */
  convert(object, logger, options = {}) {

  }
}

module.exports = Record;