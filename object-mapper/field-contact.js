/**
 * field-contact
 */

/**
 * Field Compose like email, telephone etc
 */

const FieldText = require('./field-text').FieldText;
const FieldGuid = require('./field-text').FieldGuid;

const FieldObject = require('./field-object').FieldObject;
const NameParse = require('../lib/name-parser').ParseFullName;

class FieldContact extends FieldObject {

  constructor(options = {}) {
    super(options);
    this._fields = {
      // fields for the database
      subName: new FieldText(),        // the name of the code
      firstName: new FieldText(),      // the id, overrules the type
      middleName: new FieldText(),
      title: new FieldText(),
      firstLetters : new FieldText(),
      nickName: new FieldText(),
      namePrefix: new FieldText(),
      name: new FieldText(),
      nameSuffix: new FieldText(),

      // used to for calculations
      fullName: new FieldText(),
      organization: new FieldText({emptyAllow: true}),
      organizationId: new FieldGuid({emptyAllow: true}),

      _source: new FieldText({emptyAllow: true}),      // the ref to only update our own info
    };
    this._parser = new NameParse();
  }

  /**
   * just process all keys individual
   *
   * @param fieldName
   * @param fields the field parsers
   * @param data the data given
   * @param logger Class where to store the errors
   */
  async processKeys(fieldName, fields, data, logger) {
    let result = {};
    if (fields.fullName && fields.name === undefined) {
      // parse the fullname only if there isn't already a name
      let parsed = this._parser.analyse(data.fullName);
      if (parsed.error.length) {
        this.log(logger, 'warn', fieldName + 'fullName', parsed.error.join(', ') );
      }
      const mapping = {
        last : 'lastName',
        first: 'firstName',
        middle: 'middleName',
        nick: 'nickName',
        // what to do with the middle name and nick
        title: 'title',
        prefix: 'namePrefix',
        suffix: 'nameSuffix'
      };
      for (let field in mapping) {
        if (parsed[field].length) {
          result[mapping[field]] = parsed[field];
        }
      }
    }
    if (fields.firstLetters === undefined && result.firstName) {
      if (result.firstName.indexOf('.') > 0) {  // so not J. but Jaap
        result.firstLetters = result.firstName;
        delete result.firstName;
      } else {
        result.firstLetters = result.firstName.substr(0, 1).toUpperCase() + '.'
      }
      if (result.middleName && result.firstLetters.length) {
        result.firstLetters += result.middleName.substr(0, 1).toUpperCase() + result.middleName.indexOf('.') !== 1;
      }
    }
    this.copyFieldsToResult(result, data, ['fullName']);
    return result;
  }
}

module.exports.FieldContact = FieldContact;