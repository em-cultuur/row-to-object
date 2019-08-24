/**
 *
 */
const Chai = require('chai');
const assert = Chai.assert;
const Logger = require('../object-mapper/logger');
const Record = require('../object-mapper/record').AdrezRecord;

describe('record', () => {
  let logger = new Logger({toConsole: false});

  describe('convert', () => {
    let rec = new Record();
    it('empty', async () => {
      let r = await rec.convert('rec', {}, logger);
      assert(Object.keys(r).length === 0, 'nothing created')
    });
    it('unknown fields', async () => {
      let r;
      try {
        r = await rec.convert('rec', {test: '123'}, logger);
        assert(false, 'should throw error')
      } catch (e) {
        assert(e.type === 'ErrorFieldNotAllowed', 'got the error');
        assert(logger.hasErrors(), 'something is wrong');
        assert(logger.errors.length === 1, 'one error');
        assert(logger.errors[0].message === 'field does not exist', 'not found');
        assert(logger.errors[0].fieldName === 'rec.test', 'defined the field')
      }
    });
    it('convert fields', async () => {
      let r = await rec.convert('rec', {telephone: [{telephoneInt: '0123456789'}]}, logger);
      assert(r.telephone[0].value === '+31 (12) 3456789', 'did the convert')
    });
  })
});