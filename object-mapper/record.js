/**
 * convert an array
 */

const Field = require('./field').Field;

class Record extends Field {

  constructor(options = {}){
    super(options);
    this._name = 'record';
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