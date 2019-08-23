/**
 * Field Compose like email, telephone etc
 */

const FieldText = require('./field-text').FieldText;
const FieldGuid = require('./field-text').FieldGuid;

const FieldObject = require('./field-object').FieldObject;

class FieldComposed extends FieldObject {

  constructor(options = {}) {
    super(options);
    this._fields = {
      type: new FieldText(),        // the name of the code
      typeId: new FieldGuid(),      // the id, overrules the type
      value: options.valueType ? options.valueType : new FieldText(),  // the field to store
      _source: new FieldText({emptyAllow: true}),      // the ref to only update our own info
    }
  }
}

module.exports.FieldComposed = FieldComposed;