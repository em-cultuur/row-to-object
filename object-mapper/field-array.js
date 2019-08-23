/**
 * convert an array
 */

const Field = require('./field').Field;
const FieldText = require('./field-text').FieldText;




class FieldArray extends Field {

  constructor(options = {}){
    super(options);
    this._name = 'array';
    this._type = options.type ? options.type : new FieldText();
  }


  /**
   *
   * @param fieldName String
   * @param data Array
   * @param logger
   */
  validate(fieldName, data, logger = false) {
    let isValid = true;
    if (Array.isArray(data)) {
      let fieldDefinition = this._type;
      for (let l = 0; l < data.length; l++) {
        let subName = `${fieldName}[${l}]`;
        isValid = fieldDefinition.validate(subName, data[l], logger);
      }
      return isValid;
    } else {
      this.log(logger, 'error', fieldName, 'field is not an array')
      return false;
    }
  }

  /**
   * check if all element are empty
   * @param data
   * @return {boolean}
   */
  isEmpty(data) {
    for (let l = 0; l < data.length; l++) {
      if (!this._type.isEmpty(data[l])) {
        return false;
      }
    }
    return true;
  }
  /**
   * adjust the object. if error or warnings use the logger
   * @param fieldName String
   * @param data Object
   * @param logger Class logger
   */
  async convert(fieldName, data, logger = false) {
    let result = [];

    if (Array.isArray(data)) {
      let fieldDefinition = this._type;
      for (let l = 0; l < data.length; l++) {
        let subName = `${fieldName}[${l}]`;
        let elm = await fieldDefinition.convert(subName, data[l], logger);
        if (!fieldDefinition.isEmpty(elm)) {
          result.push(elm);
        }
      }
    } else {
      this.log(logger, 'error', fieldName, 'field is not an array')
    }
    return Promise.resolve(result);
  }
}

module.exports.FieldArray = FieldArray;