/**
 * array
 */

const Field = require('./field').Field;
const FieldGuid = require('./field-text').FieldGuid;
const FieldContact  = require('./field-contact').FieldContact;
const FieldLocation = require('./field-location').FieldLocation;
const FieldEmail = require('./field-email').FieldEmail;
const FieldTelephone = require('./field-telephone').FieldTelephone;

const FieldEmail = require('./field-text-email').FieldEmail;

class Record extends Field {

  constructor(options = {}){
    super(options);
    this._name = 'record';
    this._fields = {
      id: new FieldGuid(),
      contact :     new FieldArray( { type: new FieldContact() }),
      email:        new FieldArray( { type: new FieldEmail() }),
      telephone:    new FieldArray( { type: new FieldTelephone() } ),
      location:     new FieldArray( { type: new FieldLocation() })
    }
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

module.exports = Record;