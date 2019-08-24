/**
 * Field Location
 */

const FieldText = require('./field-text').FieldText;
const FieldGuid = require('./field-text').FieldGuid;

const FieldObject = require('./field-object').FieldObject;
const FieldZipcode = require('./field-text-zipcode').FieldTextZipcode;

const Countries = require('../lib/lookup').Countries;
const countryNumberRightId = require('../lib/lookup').countryNumberRightId;
const Lookup = require('../lib/lookup');

class FieldLocation extends FieldObject {

  constructor(options = {}) {
    super(options);
    this._fields = {
      type: new FieldText(),        // the name of the code
      typeId: new FieldGuid(),      // the id, overrules the type

      street: new FieldText(),
      number: new FieldText(),
      suffix: new FieldText(),
      streetNumber: new FieldText(),
      zipcode: new FieldZipcode(),
      city: new FieldText(),
      country: new FieldText({emptyAllow: true}),
      countryId: new FieldGuid({emptyAllow: true}),

      _source: new FieldText({ emptyAllow: true }),      // the ref to only update our own info
    }
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

    // start with the proper country
    if (data.countryId === undefined && data.country === undefined && data.zipcode === undefined) {
      // nothing to detect the country: take default
      result.countryId = Countries.nl;
    } else if (data.countryId === undefined && data.country === undefined) {
      // try to use the zipcode
      result.countryId = this._fields.zipcode.countryId(data.zipcode, Countries.nl);
    } else if (data.countryId === undefined) {
      // translate the name into the code
      try {
         result.countryId = await Lookup.country(data.country)
      } catch (e) {
        this.log(logger, 'error', fieldName + '.countryId', e.message);
        result.countryId = Countries.nl; // set default
      }
    }

    // streetNumber can be split if street and number do NOT exist
    if (data.street === undefined || data.number === undefined) {
      if (data.streetNumber) {
        if (countryNumberRightId(result.countryId)) {
          const re = /^(\d*[\wäöüß\d '\-\.]+)[,\s]+(\d+)\s*([\wäöüß\d\-\/]*)$/i;
          let match = data.streetNumber.match(re);
          if (match) {
            match.shift(); // verwijder element 0=het hele item
            //match is nu altijd een array van 3 items
            result.street = match[0].trim();
            result.number = match[1].trim();
            result.suffix = match[2].trim();
          } else {
            this.log(logger, 'warn', fieldName + '.streetNumber', `can not parse: "${data.streetNumber}"`);
            result.street = field.data.streetNumber;
          }
        } else {
          // we do not parse other formats
          result.street = data.streetNumber;
        }
      }
    }

    this.copyFieldsToResult(result, data);

    if ((result.street === undefined || result.street.length === 0) && data.zipcode) {
      // do a lookup on zipcode for nl && b
      try {
        result.street = await Lookup.zipcodeToStreet(result.zipcode, result.number, result.countryId)
      } catch (e) {
        this.log(logger, 'error', fieldName + '.street', e.message);
      }
    }
    if (result.zipcode === undefined && (result.street && result.number && result.city && result.countryId === Countries.nl)) {
      // do a lookup on zipcode for nl && b
      try {
        result.zipcode = await Lookup.streetToZipcode(result.street, result.number, result.city)
      } catch (e) {
        this.log(logger, 'error', fieldName + '.zipcode', e.message);
      }
    }


    return Promise.resolve(result);
  }

}

module.exports.FieldLocation = FieldLocation;