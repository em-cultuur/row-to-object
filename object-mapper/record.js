/**
 * array
 */

const FieldObject = require('./field-object').FieldObject;
const FieldGuid = require('./field-text').FieldGuid;
const FieldArray = require('./field-array').FieldArray;
const FieldContact  = require('./field-contact').FieldContact;
const FieldLocation = require('./field-location').FieldLocation;
const FieldEmail = require('./field-email').FieldEmail;
const FieldTelephone = require('./field-telephone').FieldTelephone;

class AdrezRecord extends FieldObject {

  constructor(options = {}){
    super(options);
    this._name = 'record';
    this._fields = {
      id: new FieldGuid(),
      contact:      new FieldArray( { type: new FieldContact() }),
      email:        new FieldArray( { type: new FieldEmail() }),
      telephone:    new FieldArray( { type: new FieldTelephone() } ),
      location:     new FieldArray( { type: new FieldLocation() })
    }
  }

}

module.exports.AdrezRecord = AdrezRecord;