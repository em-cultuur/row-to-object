/**
 * Field boolean
 */

const Field = require('./field').Field;

class FieldTextBoolean extends Field {
  constructor(options = {}){
    super(options);
    this._name = 'boolean';
  }

  /**
   * validate a fields properties (keys)
   * it ONLY checkes that the structure of data can be handled by this routine
   *
   * @param fieldName String,
   * @param data any value that can be converted into an boolean
   * @param logger Class logger class. if available the info is logged to this object
   * @return {boolean} True: it can be handled, False: structure has an error
   */
  validate(fieldName, data, logger = false) {
    if (data !== undefined) {
      if (typeof data === 'object') {
        this.log(logger, 'error', fieldName, 'must be string or number or boolean');
        return false;
      }
    }
    data = !!data;
    return true;
  }

  isEmpty(data) {
    return data === undefined
  }

  adjust(fieldName, data, logger = false) {
    return Promise.resolve(!! data);
  }
}
module.exports.FieldTextBoolean = FieldTextBoolean;
